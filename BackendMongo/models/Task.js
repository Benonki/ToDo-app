const mongoose = require('mongoose');
const DatabaseQueryTimer = require('../lib/DatabaseQueryTimer');

const dailyTaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    tasks: [
        {
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true },
            color: String,
            title: String,
            description: String
        }
    ]
});

dailyTaskSchema.index({ userId: 1, date: 1 });

const referencedTaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    color: String,
    title: String,
    description: String
}, { timestamps: true });

referencedTaskSchema.index({ userId: 1, date: 1 });

class MongooseModelWrapper {
    constructor(modelName, schema) {
        this.model = mongoose.models[modelName] || mongoose.model(modelName, schema);
    }

    create(data) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.create`,
            () => this.model.create(data)
        );
    }

    insertMany(data) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.insertMany`,
            () => this.model.insertMany(data)
        );
    }

    countDocuments(filter = {}) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.countDocuments`,
            () => this.model.countDocuments(filter).exec()
        );
    }

    findOne(filter) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.findOne`,
            () => this.model.findOne(filter).exec()
        );
    }

    find(filter = {}, options = {}) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.find`,
            () => {
                let query = this.model.find(filter);

                if (options.sort) {
                    query = query.sort(options.sort);
                }

                return query.exec();
            }
        );
    }

    findById(id) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.findById`,
            () => this.model.findById(id).exec()
        );
    }

    findOneAndUpdate(filter, update, options = {}) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.findOneAndUpdate`,
            () => this.model.findOneAndUpdate(filter, update, options).exec()
        );
    }

    updateOne(filter, update, options = {}) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.updateOne`,
            () => this.model.updateOne(filter, update, options).exec()
        );
    }

    deleteOne(filter) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.deleteOne`,
            () => this.model.deleteOne(filter).exec()
        );
    }

    deleteById(id) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.findByIdAndDelete`,
            () => this.model.findByIdAndDelete(id).exec()
        );
    }

    saveDocument(document) {
        return DatabaseQueryTimer.measure(
            `${this.model.modelName}.save`,
            () => document.save()
        );
    }
}

module.exports = {
    daily: new MongooseModelWrapper('Task', dailyTaskSchema),
    referenced: new MongooseModelWrapper('ReferencedTask', referencedTaskSchema)
};
