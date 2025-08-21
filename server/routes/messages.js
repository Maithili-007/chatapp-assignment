
import express from 'express';
import { auth } from '../middleware/auth.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

const router = express.Router();

router.get('/:id/messages', auth, async (req, res) => {
  const otherId = req.params.id;
  const members = [req.user._id.toString(), otherId].sort();
  let convo = await Conversation.findOne({ members });
  if (!convo) return res.json({ messages: [] });
  const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 }).lean();
  res.json({ messages });
});

export default router;
