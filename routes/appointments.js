import express from 'express';
import Appointment from '../models/Appointment.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments (admin/barber) or user's appointments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user.userId;
    } else if (req.user.role === 'barber') {
      query.barber = req.user.userId;
    }
    // Admin can see all appointments

    const appointments = await Appointment.find(query)
      .populate('customer', 'name phone email')
      .populate('barber', 'name name')
      .populate('service', 'name nameAr price duration')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create appointment with repeat functionality
router.post('/', auth, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      customer: req.user.userId
    };

    // Create main appointment
    const mainAppointment = new Appointment(appointmentData);
    await mainAppointment.save();

    let allAppointments = [mainAppointment];

    // Handle repeat appointments
    if (req.body.isRepeating && req.body.repeatConfig) {
      const { interval, unit, occurrences } = req.body.repeatConfig;
      const childAppointments = [];

      for (let i = 1; i < occurrences; i++) {
        const nextDate = new Date(appointmentData.date);

        if (unit === 'day') {
          nextDate.setDate(nextDate.getDate() + (interval * i));
        } else if (unit === 'week') {
          nextDate.setDate(nextDate.getDate() + (interval * 7 * i));
        } else if (unit === 'month') {
          nextDate.setMonth(nextDate.getMonth() + (interval * i));
        }

        const childAppointment = new Appointment({
          ...appointmentData,
          date: nextDate,
          parentAppointment: mainAppointment._id,
          isRepeating: false
        });

        await childAppointment.save();
        childAppointments.push(childAppointment._id);
        allAppointments.push(childAppointment);
      }

      // Update main appointment with child references
      mainAppointment.childAppointments = childAppointments;
      await mainAppointment.save();
    }

    // Populate and return all appointments
    const populatedAppointments = await Appointment.find({
      _id: { $in: allAppointments.map(apt => apt._id) }
    })
      .populate('customer', 'name phone email')
      .populate('barber', 'name')
      .populate('service', 'name nameAr price duration');

    res.status(201).json(populatedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && appointment.customer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('customer', 'name phone email')
      .populate('barber', 'name')
      .populate('service', 'name nameAr price duration');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete appointment (and related repeats)
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && appointment.customer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If it's a parent appointment, delete all child appointments
    if (appointment.childAppointments && appointment.childAppointments.length > 0) {
      await Appointment.deleteMany({ _id: { $in: appointment.childAppointments } });
    }

    // If it's a child appointment, remove reference from parent
    if (appointment.parentAppointment) {
      await Appointment.findByIdAndUpdate(
        appointment.parentAppointment,
        { $pull: { childAppointments: appointment._id } }
      );
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user.userId;
    } else if (req.user.role === 'barber') {
      query.barber = req.user.userId;
    }

    const totalAppointments = await Appointment.countDocuments(query);
    const completedAppointments = await Appointment.countDocuments({
      ...query,
      status: 'completed'
    });
    const pendingAppointments = await Appointment.countDocuments({
      ...query,
      status: 'pending'
    });
    const cancelledAppointments = await Appointment.countDocuments({
      ...query,
      status: 'cancelled'
    });

    // Calculate total spent (for customers) or earned (for barbers)
    const completedApts = await Appointment.find({
      ...query,
      status: 'completed'
    });
    const totalAmount = completedApts.reduce((sum, apt) => sum + apt.totalPrice, 0);

    res.json({
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;