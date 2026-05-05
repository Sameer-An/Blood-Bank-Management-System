const router = require('express').Router();
const Donor = require('../models/Donor');
const { verifyToken } = require('../middleware/auth');

// Register / update donor profile
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { name, age, weight, bloodGroup, address, phone, pinCode } = req.body;
    if (age < 18 || age > 65) return res.status(400).json({ message: 'Age must be between 18 and 65' });
    if (weight < 50) return res.status(400).json({ message: 'Weight must be at least 50 kg' });

    const data = { name, age, weight, bloodGroup, address, phone, pinCode, available: true };
    const donor = await Donor.findOneAndUpdate({ userId: req.user.id }, data, { new: true, upsert: true });
    res.json({ message: 'You are registered as a donor. You are now available for donation!', donor });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my profile
router.get('/me', verifyToken, async (req, res) => {
  try { res.json(await Donor.findOne({ userId: req.user.id })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all donors (blood bank & admin)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.pinCode) filter.pinCode = req.query.pinCode;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    res.json(await Donor.find(filter));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete donor (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try { await Donor.findByIdAndDelete(req.params.id); res.json({ message: 'Donor deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
