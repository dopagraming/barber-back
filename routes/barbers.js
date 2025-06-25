import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create barber (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const barber = new User({
      ...req.body,
      role: 'barber'
    });

    await barber.save();
    res.status(201).json(barber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;