const router = require('express').Router();
const BloodBank = require('../models/BloodBank');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Search blood banks by blood group + units + pinCode
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { bloodGroup, units, pinCode } = req.query;
    const banks = await BloodBank.find({ pinCode });
    const available = banks.filter(b => b.stock[bloodGroup] >= parseInt(units));
    res.json(available);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Send request to a blood bank
router.post('/request', verifyToken, async (req, res) => {
  try {
    const existing = await BloodRequest.findOne({ recipientId: req.user.id, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'You already have a pending request' });

    const user = await User.findById(req.user.id);
    const { bloodBankId, bloodGroup, units } = req.body;
    await new BloodRequest({ recipientId: req.user.id, recipientName: user.name, recipientPhone: user.phone, bloodBankId, bloodGroup, units }).save();
    res.json({ message: 'Request sent to the blood bank!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my requests
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    res.json(await BloodRequest.find({ recipientId: req.user.id }).populate('bloodBankId', 'bankName address'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all (admin)
router.get('/all', verifyToken, async (req, res) => {
  try { res.json(await BloodRequest.find().populate('bloodBankId', 'bankName')); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try { await BloodRequest.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
