const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: Date, required: true},
    tasks: [
        {
            startTime: {type: Date, required: true},
            endTime: {type: Date, required: true},
            color: String,
            title: String,
            description: String
        }
    ]
});

module.exports = mongoose.model('Task', taskSchema, 'Task');