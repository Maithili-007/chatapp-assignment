
import express from 'express';
import { auth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select('_id name email')
    .lean();
  // Optional: include last message preview
  res.json({ users });
});

export default router;
