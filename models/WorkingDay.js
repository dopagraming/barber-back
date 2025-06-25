import mongoose from 'mongoose';

const workingDaySchema = new mongoose.Schema({
    dayId: {
        type: String,
        required: true,
        unique: true,
        enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    name: {
        type: String,
        required: true
    },
    nameHe: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('WorkingDay', workingDaySchema);