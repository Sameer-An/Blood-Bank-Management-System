const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bankName: String,
  address:  String,
  pinCode:  String,
  stock: {
    'A+':  { type: Number, default: 0 },
    'A-':  { type: Number, default: 0 },
    'B+':  { type: Number, default: 0 },
    'B-':  { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+':  { type: Number, default: 0 },
    'O-':  { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodBank', bloodBankSchema);
