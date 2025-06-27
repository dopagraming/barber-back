import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  totalPrice: {
    type: Number,
    required: true
  },
  peopleCount: {
    type: Number,
    default: 1,
    min: 1
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    default: ''
  },
  // Repeat functionality
  isRepeating: {
    type: Boolean,
    default: false
  },
  repeatConfig: {
    interval: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['day', 'week', 'month'],
      default: 'week'
    },
    endDate: {
      type: Date
    },
    occurrences: {
      type: Number
    }
  },
  parentAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  childAppointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ date: 1, barber: 1 });
appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ parentAppointment: 1 });

export default mongoose.model('Appointment', appointmentSchema);