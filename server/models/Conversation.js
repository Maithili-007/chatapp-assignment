
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  members: [{ type: String, required: true }], // [userId1, userId2] sorted
  lastMessage: { type: String },
  lastMessageAt: { type: Date }
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);
