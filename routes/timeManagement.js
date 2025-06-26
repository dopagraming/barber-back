import express from 'express';
import TimeSlot from '../models/TimeSlot.js';
import WorkingDay from '../models/WorkingDay.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all working days
router.get('/working-days', async (req, res) => {
    try {
        const workingDays = await WorkingDay.find().sort({ order: 1 });
        res.json(workingDays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update working days (admin only)
router.put('/working-days', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { workingDays } = req.body;

        for (const day of workingDays) {
            await WorkingDay.findOneAndUpdate(
                { dayId: day.dayId },
                day,
                { upsert: true, new: true }
            );
        }

        const updatedDays = await WorkingDay.find().sort({ order: 1 });
        res.json(updatedDays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all time slots
router.get('/time-slots', async (req, res) => {
    try {
        const timeSlots = await TimeSlot.find().sort({ time: 1 });
        res.json(timeSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get time slots for specific day
router.get('/time-slots/:day', async (req, res) => {
    try {
        const { day } = req.params;
        const timeSlots = await TimeSlot.find({
            workingDays: day,
        }).sort({ time: 1 });
        res.json(timeSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new time slot (admin only)
router.post('/time-slots', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timeSlot = new TimeSlot(req.body);
        await timeSlot.save();
        res.status(201).json(timeSlot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update time slot (admin only)
router.put('/time-slots/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timeSlot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!timeSlot) {
            return res.status(404).json({ message: 'Time slot not found' });
        }

        res.json(timeSlot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete time slot (admin only)
router.delete('/time-slots/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await TimeSlot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Time slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get available schedule for booking
router.get('/available-schedule', async (req, res) => {
    try {
        const workingDays = await WorkingDay.find({ enabled: true }).sort({ order: 1 });
        const timeSlots = await TimeSlot.find({ enabled: true }).sort({ time: 1 });

        res.json({
            workingDays,
            timeSlots
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;