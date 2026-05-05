const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  recipientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName:  String,
  recipientPhone: String,
  bloodBankId:    { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  bloodGroup:     String,
  units:          Number,
  status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
