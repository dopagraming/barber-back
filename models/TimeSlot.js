import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true
    },
    workingDays: [{
        type: String,
        enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        required: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
timeSlotSchema.index({ time: 1, workingDays: 1 });

export default mongoose.model('TimeSlot', timeSlotSchema);