const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName:  String,
  address:    String,
  pinCode:    String,
  date:       String,
  organizer:  String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
