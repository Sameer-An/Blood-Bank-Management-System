const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, pinCode, password, role, bankName, address } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, phone, pinCode, password, role });
    await user.save();

    if (role === 'bloodbank') {
      await new BloodBank({ userId: user._id, bankName: bankName || name, address: address || '', pinCode }).save();
    }
    res.json({ message: 'Registered successfully!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, pinCode: user.pinCode, phone: user.phone } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
