import express from 'express';
import { auth } from '../middleware/auth.js';
import TimeSettings from '../models/TimeSettings.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Get time settings
router.get('/settings', async (req, res) => {
    try {
        let settings = await TimeSettings.findOne();

        if (!settings) {
            // If not found, create default settings
            settings = await TimeSettings.create({
                workingDays: [
                    { id: 'sunday', name: 'الأحد', enabled: true, openTime: '09:00', closeTime: '21:00', slotDuration: 40 },
                    { id: 'monday', name: 'الاثنين', enabled: true, openTime: '09:00', closeTime: '21:00', slotDuration: 20 },
                    { id: 'tuesday', name: 'الثلاثاء', enabled: true, openTime: '09:00', closeTime: '21:00', slotDuration: 40 },
                    { id: 'wednesday', name: 'الأربعاء', enabled: true, openTime: '09:00', closeTime: '21:00', slotDuration: 40 },
                    { id: 'thursday', name: 'الخميس', enabled: true, openTime: '09:00', closeTime: '21:00', slotDuration: 40 },
                    { id: 'friday', name: 'الجمعة', enabled: false, openTime: '14:00', closeTime: '18:00', slotDuration: 40 },
                    { id: 'saturday', name: 'السبت', enabled: false, openTime: '09:00', closeTime: '21:00', slotDuration: 40 },
                ],
                breakTime: {
                    enabled: true,
                    startTime: '12:00',
                    endTime: '13:00'
                },
                lastUpdated: new Date()
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update time settings (admin only)
router.put('/settings', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let settings = await TimeSettings.findOne();

        if (settings) {
            settings.set({ ...req.body, lastUpdated: new Date() });
            await settings.save();
        } else {
            settings = await TimeSettings.create({ ...req.body, lastUpdated: new Date() });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate available time slots for a specific date
router.get('/slots/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const requestDate = new Date(date);
        const dayIndex = requestDate.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayIndex];

        const settings = await TimeSettings.findOne();
        if (!settings) return res.json([]);

        const dayConfig = settings.workingDays.find(d => d.id === dayName);
        if (!dayConfig || !dayConfig.enabled) return res.json([]);

        const slots = [];
        const start = new Date(`2000-01-01T${dayConfig.openTime}:00`);
        const end = new Date(`2000-01-01T${dayConfig.closeTime}:00`);

        const breakStart = settings.breakTime?.enabled
            ? new Date(`2000-01-01T${settings.breakTime.startTime}:00`)
            : null;
        const breakEnd = settings.breakTime?.enabled
            ? new Date(`2000-01-01T${settings.breakTime.endTime}:00`)
            : null;
        const startOfDay = new Date(requestDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(requestDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $ne: 'cancelled' }
        });
        const bookedTimes = bookedAppointments.map(a => a.time);

        let current = new Date(start);

        while (current < end) {
            const slotEnd = new Date(current.getTime() + dayConfig.slotDuration * 60000);
            const timeStr = current.toTimeString().slice(0, 5);


            const isBreakTime = breakStart && breakEnd &&
                ((current >= breakStart && current < breakEnd) ||
                    (slotEnd > breakStart && slotEnd <= breakEnd) ||
                    (current < breakStart && slotEnd > breakEnd));

            const isBooked = bookedTimes.includes(timeStr);

            if (!isBreakTime && slotEnd <= end && !isBooked) {
                slots.push({
                    time: timeStr,
                    duration: dayConfig.slotDuration,
                    available: true
                });
            }

            current = new Date(current.getTime() + dayConfig.slotDuration * 60000);
        }

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
