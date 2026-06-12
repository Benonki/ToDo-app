const DatabaseQueryTimer = require('../lib/DatabaseQueryTimer');

class TaskRepository {
  constructor(taskModels) {
    this.dailyModel = taskModels.daily;
    this.referencedModel = taskModels.referenced;
  }

  async countDaily(filter = {}) {
    return DatabaseQueryTimer.measure('Task.countDocuments', () =>
      this.dailyModel.countDocuments(filter).exec(),
    );
  }

  async countReferenced(filter = {}) {
    return DatabaseQueryTimer.measure('ReferencedTask.countDocuments', () =>
      this.referencedModel.countDocuments(filter).exec(),
    );
  }

  async findDailyByUserAndDateRange(userId, startOfDay, endOfDay) {
    return DatabaseQueryTimer.measure('Task.findByDateRange', () =>
      this.dailyModel
        .findOne({
          userId,
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .exec(),
    );
  }

  async findDailyByUserAndDate(userId, date) {
    return DatabaseQueryTimer.measure('Task.findByDate', () =>
      this.dailyModel.findOne({ userId, date }).exec(),
    );
  }

  async findDailyByNestedTask(userId, taskId) {
    return DatabaseQueryTimer.measure('Task.findByNestedTask', () =>
      this.dailyModel
        .findOne({
          userId,
          'tasks._id': taskId,
        })
        .exec(),
    );
  }

  async createDaily(data) {
    return DatabaseQueryTimer.measure('Task.create', () =>
      this.dailyModel.create(data),
    );
  }

  async saveDaily(taskDocument) {
    return DatabaseQueryTimer.measure('Task.save', () => taskDocument.save());
  }

  async deleteDailyTaskByUserAndTaskId(userId, taskId) {
    return DatabaseQueryTimer.measure('Task.deleteNestedTask', () =>
      this.dailyModel
        .updateOne(
          {
            userId,
            'tasks._id': taskId,
          },
          {
            $pull: {
              tasks: { _id: taskId },
            },
          },
        )
        .exec(),
    );
  }

  async findReferencedByUserAndDateRange(userId, startOfDay, endOfDay) {
    return DatabaseQueryTimer.measure('ReferencedTask.findByDateRange', () =>
      this.referencedModel
        .find({
          userId,
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .sort({ startTime: 1 })
        .exec(),
    );
  }

  async findReferencedByIdAndUser(userId, taskId) {
    return DatabaseQueryTimer.measure('ReferencedTask.findByIdAndUser', () =>
      this.referencedModel.findOne({ _id: taskId, userId }).exec(),
    );
  }

  async createReferenced(data) {
    return DatabaseQueryTimer.measure('ReferencedTask.create', () =>
      this.referencedModel.create(data),
    );
  }

  async insertManyReferenced(data) {
    return DatabaseQueryTimer.measure('ReferencedTask.insertMany', () =>
      this.referencedModel.insertMany(data),
    );
  }

  async updateReferencedByIdAndUser(userId, taskId, data) {
    return DatabaseQueryTimer.measure('ReferencedTask.updateByIdAndUser', () =>
      this.referencedModel
        .findOneAndUpdate(
          {
            _id: taskId,
            userId,
          },
          { $set: data },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec(),
    );
  }

  async deleteReferencedByIdAndUser(userId, taskId) {
    return DatabaseQueryTimer.measure('ReferencedTask.deleteByIdAndUser', () =>
      this.referencedModel.deleteOne({ _id: taskId, userId }).exec(),
    );
  }
}

module.exports = TaskRepository;