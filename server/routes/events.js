const router = require('express').Router();
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');

// Get all events (public)
router.get('/', async (req, res) => {
  try { res.json(await Event.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete event (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ message: 'Event deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
