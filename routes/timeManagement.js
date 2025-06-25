import express from 'express';
import TimeSlot from '../models/TimeSlot.js';
import WorkingDay from '../models/WorkingDay.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all working days
router.get('/working-days', async (req, res) => {
    try {
        const workingDays = await WorkingDay.find().sort({ order: 1 });

        // If no working days exist, create default ones
        if (workingDays.length === 0) {
            const defaultDays = [
                { dayId: 'sunday', name: 'الأحد', nameHe: 'ראשון', enabled: true, order: 0 },
                { dayId: 'monday', name: 'الاثنين', nameHe: 'שני', enabled: true, order: 1 },
                { dayId: 'tuesday', name: 'الثلاثاء', nameHe: 'שלישי', enabled: true, order: 2 },
                { dayId: 'wednesday', name: 'الأربعاء', nameHe: 'רביעי', enabled: true, order: 3 },
                { dayId: 'thursday', name: 'الخميس', nameHe: 'חמישי', enabled: true, order: 4 },
                { dayId: 'friday', name: 'الجمعة', nameHe: 'שישי', enabled: false, order: 5 },
                { dayId: 'saturday', name: 'السبت', nameHe: 'שבת', enabled: false, order: 6 },
            ];

            const createdDays = await WorkingDay.insertMany(defaultDays);
            return res.json(createdDays);
        }

        res.json(workingDays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update working days
router.put('/working-days', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { workingDays } = req.body;

        for (const day of workingDays) {
            await WorkingDay.findOneAndUpdate(
                { dayId: day.id },
                {
                    enabled: day.enabled,
                    name: day.name,
                    nameHe: day.nameHe,
                    order: day.order || 0
                },
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

        // If no time slots exist, create default ones
        if (timeSlots.length === 0) {
            const defaultSlots = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
                '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
            ].map((time, index) => ({
                time,
                enabled: true,
                order: index
            }));

            const createdSlots = await TimeSlot.insertMany(defaultSlots);
            return res.json(createdSlots);
        }

        res.json(timeSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new time slot
router.post('/time-slots', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { time } = req.body;

        const existingSlot = await TimeSlot.findOne({ time });
        if (existingSlot) {
            return res.status(400).json({ message: 'Time slot already exists' });
        }

        const timeSlot = new TimeSlot({
            time,
            enabled: true,
            order: await TimeSlot.countDocuments()
        });

        await timeSlot.save();
        res.status(201).json(timeSlot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update time slot
router.put('/time-slots/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { enabled } = req.body;

        const timeSlot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            { enabled },
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

// Delete time slot
router.delete('/time-slots/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);

        if (!timeSlot) {
            return res.status(404).json({ message: 'Time slot not found' });
        }

        res.json({ message: 'Time slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get available schedule (for booking)
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