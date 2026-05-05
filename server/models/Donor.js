const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       String,
  age:        Number,
  weight:     Number,
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  address:    String,
  phone:      String,
  pinCode:    String,
  available:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
