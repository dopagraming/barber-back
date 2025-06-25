import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics (admin only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Total counts
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBarbers = await User.countDocuments({ role: 'barber' });
    const totalServices = await Service.countDocuments({ isActive: true });

    // Appointments stats
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    const monthlyAppointments = await Appointment.countDocuments({
      date: { $gte: startOfMonth }
    });

    // Revenue stats
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
          status: 'completed',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Popular services
    const popularServices = await Appointment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      totalCustomers,
      totalBarbers,
      totalServices,
      totalAppointments,
      todayAppointments,
      monthlyAppointments,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      popularServices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;