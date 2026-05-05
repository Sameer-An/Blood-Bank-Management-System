const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, pinCode, password, role, bankName, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, phone, pinCode, password, role });
    await user.save();

    if (role === 'bloodbank') {
      await new BloodBank({
        userId: user._id,
        bankName: bankName || name,
        address: address || '',
        pinCode
      }).save();
    }

    res.json({ message: 'Registered successfully!' });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pinCode: user.pinCode,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
