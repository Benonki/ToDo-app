const mongoose = require('mongoose');
const DatabaseQueryTimer = require('../lib/DatabaseQueryTimer');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
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

class TaskModel {
    constructor() {
        this.model = mongoose.model('Task', taskSchema);
    }

    create(data) {
        return DatabaseQueryTimer.measure(
            'Task.create',
            () => this.model.create(data)
        );
    }

    findOne(filter) {
        return DatabaseQueryTimer.measure(
            'Task.findOne',
            () => this.model.findOne(filter).exec()
        );
    }

    find(filter = {}) {
        return DatabaseQueryTimer.measure(
            'Task.find',
            () => this.model.find(filter).exec()
        );
    }

    findById(id) {
        return DatabaseQueryTimer.measure(
            'Task.findById',
            () => this.model.findById(id).exec()
        );
    }

    findOneAndUpdate(filter, update, options = {}) {
        return DatabaseQueryTimer.measure(
            'Task.findOneAndUpdate',
            () => this.model.findOneAndUpdate(filter, update, options).exec()
        );
    }

    updateOne(filter, update, options = {}) {
        return DatabaseQueryTimer.measure(
            'Task.updateOne',
            () => this.model.updateOne(filter, update, options).exec()
        );
    }

    deleteOne(filter) {
        return DatabaseQueryTimer.measure(
            'Task.deleteOne',
            () => this.model.deleteOne(filter).exec()
        );
    }

    deleteById(id) {
        return DatabaseQueryTimer.measure(
            'Task.findByIdAndDelete',
            () => this.model.findByIdAndDelete(id).exec()
        );
    }

    saveDocument(document) {
        return DatabaseQueryTimer.measure(
            'Task.save',
            () => document.save()
        );
    }
}

module.exports = new TaskModel();
