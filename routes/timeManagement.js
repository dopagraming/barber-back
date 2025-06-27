import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// In-memory storage for time settings (in production, use database)
let timeSettings = {
    workingDays: [
        {
            id: 'sunday',
            name: 'الأحد',
            enabled: true,
            openTime: '09:00',
            closeTime: '21:00',
            slotDuration: 40
        },
        {
            id: 'monday',
            name: 'الاثنين',
            enabled: true,
            openTime: '09:00',
            closeTime: '21:00',
            slotDuration: 20
        },
        {
            id: 'tuesday',
            name: 'الثلاثاء',
            enabled: true,
            openTime: '09:00',
            closeTime: '21:00',
            slotDuration: 40
        },
        {
            id: 'wednesday',
            name: 'الأربعاء',
            enabled: true,
            openTime: '09:00',
            closeTime: '21:00',
            slotDuration: 40
        },
        {
            id: 'thursday',
            name: 'الخميس',
            enabled: true,
            openTime: '09:00',
            closeTime: '21:00',
            slotDuration: 40
        },
        {
            id: 'friday',
            name: 'الجمعة',
            enabled: false,
            openTime: '14:00',
            closeTime: '18:00',
            slotDuration: 40
        },
        {
            id: 'saturday',
            name: 'السبت',
            enabled: false,
            openTime: '09:00',
            closeTime: '21:00',
            slotDuration: 40
        },
    ],
    breakTime: {
        enabled: true,
        startTime: '12:00',
        endTime: '13:00'
    }
};

// Get time settings
router.get('/settings', async (req, res) => {
    try {
        res.json(timeSettings);
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

        timeSettings = {
            ...timeSettings,
            ...req.body,
            lastUpdated: new Date().toISOString()
        };

        res.json(timeSettings);
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

        const dayConfig = timeSettings.workingDays.find(d => d.id === dayName);

        if (!dayConfig || !dayConfig.enabled) {
            return res.json([]);
        }

        const slots = [];
        const start = new Date(`2000-01-01T${dayConfig.openTime}:00`);
        const end = new Date(`2000-01-01T${dayConfig.closeTime}:00`);
        const breakStart = timeSettings.breakTime?.enabled ? new Date(`2000-01-01T${timeSettings.breakTime.startTime}:00`) : null;
        const breakEnd = timeSettings.breakTime?.enabled ? new Date(`2000-01-01T${timeSettings.breakTime.endTime}:00`) : null;

        let current = new Date(start);

        while (current < end) {
            const slotEnd = new Date(current.getTime() + dayConfig.slotDuration * 60000);
            const timeStr = current.toTimeString().slice(0, 5);

            // Check if slot overlaps with break time
            const isBreakTime = breakStart && breakEnd &&
                ((current >= breakStart && current < breakEnd) ||
                    (slotEnd > breakStart && slotEnd <= breakEnd) ||
                    (current < breakStart && slotEnd > breakEnd));

            if (!isBreakTime && slotEnd <= end) {
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