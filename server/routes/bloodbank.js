const router = require('express').Router();
const BloodBank = require('../models/BloodBank');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const Event = require('../models/Event');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get my bank profile
router.get('/me', verifyToken, async (req, res) => {
  try { res.json(await BloodBank.findOne({ userId: req.user.id })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Update stock
router.put('/stock', verifyToken, async (req, res) => {
  try {
    const bank = await BloodBank.findOneAndUpdate({ userId: req.user.id }, { stock: req.body.stock }, { new: true });
    res.json({ message: 'Stock updated!', bank });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get pending requests
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const bank = await BloodBank.findOne({ userId: req.user.id });
    res.json(await BloodRequest.find({ bloodBankId: bank._id, status: 'pending' }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Approve request
router.put('/approve/:id', verifyToken, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const bank = await BloodBank.findById(request.bloodBankId);
    if (bank.stock[request.bloodGroup] < request.units)
      return res.status(400).json({ message: 'Insufficient stock for this approval' });

    bank.stock[request.bloodGroup] -= request.units;
    await bank.save();
    request.status = 'approved';
    await request.save();
    res.json({ message: 'Request approved! Stock reduced.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Explore donors by pinCode
router.get('/donors', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.pinCode) filter.pinCode = req.query.pinCode;
    res.json(await Donor.find(filter));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add event
router.post('/event', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await new Event({ ...req.body, organizer: user.name }).save();
    res.json({ message: 'Event added!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: get all blood banks
router.get('/all', verifyToken, async (req, res) => {
  try {
    res.json(await BloodBank.find().populate('userId', 'name email phone'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: delete a blood bank
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await BloodBank.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blood bank deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
