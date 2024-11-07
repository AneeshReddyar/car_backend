const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    // required: true
  },
  model: {
    type: String,
    // required: true
  },
  variant: {
    type: String,
    // required: true // e.g., "LXi", "VXi", "ZXi"
  },
  yearOfManufacture: {
    type: Number,
    // required: true
  },
  registrationYear: {
    type: Number,
    // required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    // unique: true // e.g., "KA01AB1234"
  },
  color: {
    type: String,
    // required: true
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Petrol + CNG'],
    // required: true
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'],
    // required: true
  },
  engineDisplacement: {
    type: Number, // in CC
    // required: true
  },
  kilometers: {
    type: Number,
    // required: true
  },
  vin: {
    type: String,
    unique: true,
    // required: true
  },
  ownership: {
    type: Number, // 1st owner, 2nd owner, etc.
    // required: true,
    min: 1
  },
  insuranceValid: {
    type: Date,
    // required: true
  },
  rtoLocation: {
    type: String,
    // required: true // e.g., "Bangalore, Karnataka"
  },
  features: {
    powerSteering: { type: Boolean, default: true },
    powerWindows: { type: Boolean, default: false },
    airConditioner: { type: Boolean, default: false },
    driverAirbag: { type: Boolean, default: false },
    passengerAirbag: { type: Boolean, default: false },
    alloyWheels: { type: Boolean, default: false },
    multimediaSystem: { type: Boolean, default: false },
    centralLocking: { type: Boolean, default: false },
    abs: { type: Boolean, default: false },
    parkingSensors: { type: Boolean, default: false }
  },
  price: {
    type: Number,
    // required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  condition: {
    exterior: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Work'],
      // required: true
    },
    interior: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Work'],
      // required: true
    }
  },
  description: {
    type: String,
    // required: true
  },
  location: {
    city: {
      type: String,
      // required: true
    },
    state: {
      type: String,
      // required: true
    },
    pincode: {
      type: String,
      // required: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);