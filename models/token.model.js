const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  refreshToken: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Token', tokenSchema);