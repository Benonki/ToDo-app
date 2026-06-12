const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    tasks: [
        {
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true },
            color: { type: String, default: '#4A90E2' },
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
        }
    ]
});

dailyTaskSchema.index({ userId: 1, date: 1 });
dailyTaskSchema.index({ 'tasks.tags': 1 });

const referencedTaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    color: { type: String, default: '#4A90E2' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
}, { timestamps: true });

referencedTaskSchema.index({ userId: 1, date: 1 });
referencedTaskSchema.index({ tags: 1 });

module.exports = {
    daily: mongoose.models.Task || mongoose.model('Task', dailyTaskSchema),
    referenced: mongoose.models.ReferencedTask || mongoose.model('ReferencedTask', referencedTaskSchema)
};
