const DatabaseQueryTimer = require('../lib/DatabaseQueryTimer');

class TagRepository {
  constructor(tagModel) {
    this.tagModel = tagModel;
  }

  normalizeName(name) {
    return String(name || '')
      .trim()
      .replace(/^#/, '')
      .replace(/\s+/g, ' ');
  }

  normalizeInputTags(tags) {
    if (tags === undefined || tags === null) {
      return [];
    }

    const rawTags = Array.isArray(tags) ? tags : String(tags).split(',');
    const uniqueTags = new Map();

    rawTags.forEach((tag) => {
      const rawName =
        typeof tag === 'object' && tag !== null
          ? tag.name || tag.label || tag.value || ''
          : tag;

      const name = this.normalizeName(rawName);

      if (!name) {
        return;
      }

      const normalizedName = name.toLowerCase();

      if (!uniqueTags.has(normalizedName)) {
        uniqueTags.set(normalizedName, name);
      }
    });

    return Array.from(uniqueTags.entries())
      .slice(0, 10)
      .map(([normalizedName, name]) => ({ normalizedName, name }));
  }

  async findOrCreateMany(tags) {
    const normalizedTags = this.normalizeInputTags(tags);
    const tagIds = [];

    for (const tag of normalizedTags) {
      const tagDocument = await DatabaseQueryTimer.measure(
        'Tag.findOneAndUpdate',
        () =>
          this.tagModel
            .findOneAndUpdate(
              { normalizedName: tag.normalizedName },
              {
                $setOnInsert: {
                  name: tag.name,
                  normalizedName: tag.normalizedName,
                },
              },
              {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
              },
            )
            .exec(),
      );

      tagIds.push(tagDocument._id);
    }

    return tagIds;
  }

  async findByIds(ids) {
    const uniqueIds = [
      ...new Set(
        (ids || [])
          .map((id) => {
            if (!id) {
              return null;
            }

            if (typeof id === 'object' && id._id) {
              return id._id.toString();
            }

            return id.toString();
          })
          .filter(Boolean),
      ),
    ];

    if (uniqueIds.length === 0) {
      return [];
    }

    return DatabaseQueryTimer.measure('Tag.findByIds', () =>
      this.tagModel.find({ _id: { $in: uniqueIds } }).exec(),
    );
  }
}

module.exports = TagRepository;