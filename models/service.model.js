// service.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const serviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'inspection', 'quotation-shared', 'approved', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  serviceDetails: {
    engineOil: {
      required: { type: Boolean, default: false },
      name: String,
      quantity: Number,
      price: Number
    },
    oilFilter: {
      required: { type: Boolean, default: false },
      name: String,
      price: Number
    },
    airFilter: {
      required: { type: Boolean, default: false },
      name: String,
      price: Number
    },
    fuelFilter: {
      required: { type: Boolean, default: false },
      name: String,
      price: Number
    },
    sparkPlugs: {
      required: { type: Boolean, default: false },
      name: String,
      quantity: Number,
      price: Number
    },
    brakeFluid: {
      required: { type: Boolean, default: false },
      name: String,
      quantity: Number,
      price: Number
    },
    brakeDiscs: {
      required: { type: Boolean, default: false },
      front: Boolean,
      rear: Boolean,
      price: Number
    },
    brakePads: {
      required: { type: Boolean, default: false },
      front: Boolean,
      rear: Boolean,
      price: Number
    },
    gearboxOil: {
      required: { type: Boolean, default: false },
      name: String,
      quantity: Number,
      price: Number
    },
    coolant: {
      required: { type: Boolean, default: false },
      name: String,
      quantity: Number,
      price: Number
    },
    steering: {
      required: { type: Boolean, default: false },
      alignment: Boolean,
      balancing: Boolean,
      price: Number
    },
    clutch: {
      required: { type: Boolean, default: false },
      description: String,
      price: Number
    },
    battery: {
      required: { type: Boolean, default: false },
      name: String,
      price: Number
    },
    acService: {
      required: { type: Boolean, default: false },
      description: String,
      price: Number
    },
    other: [{
      description: String,
      price: Number
    }]
  },
  totalQuotation: {
    type: Number,
    default: 0
  },
  laborCharges: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  },
  messages: [messageSchema],
  scheduledDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);