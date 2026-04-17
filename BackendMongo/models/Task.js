const mongoose = require('mongoose');

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
        return this.model.create(data);
    }

    findOne(filter) {
        return this.model.findOne(filter);
    }

    find(filter = {}) {
        return this.model.find(filter);
    }

    findById(id) {
        return this.model.findById(id);
    }

    findOneAndUpdate(filter, update, options = {}) {
        return this.model.findOneAndUpdate(filter, update, options);
    }

    updateOne(filter, update, options = {}) {
        return this.model.updateOne(filter, update, options);
    }

    deleteOne(filter) {
        return this.model.deleteOne(filter);
    }

    deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = new TaskModel();