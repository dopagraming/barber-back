import mongoose from "mongoose";

const daySchema = new mongoose.Schema({
    id: String,
    name: String,
    enabled: Boolean,
    openTime: String,
    closeTime: String,
    slotDuration: Number,
});

const breakTimeSchema = new mongoose.Schema({
    enabled: Boolean,
    startTime: String,
    endTime: String,
});

const timeSettingsSchema = new mongoose.Schema({
    workingDays: [daySchema],
    breakTime: breakTimeSchema,
    lastUpdated: Date,
});

export default mongoose.model("TimeSettings", timeSettingsSchema);
