
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import { verifySocket } from './utils/verifySocket.js';
import { Message } from './models/Message.js';
import { Conversation } from './models/Conversation.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  }
});

// Online users map: userId -> socketId
const onlineUsers = new Map();

io.use(verifySocket);

io.on('connection', (socket) => {
  const user = socket.user; // from verifySocket
  onlineUsers.set(user._id.toString(), socket.id);
  io.emit('presence:update', Array.from(onlineUsers.keys())); // broadcast online list

  socket.on('disconnect', () => {
    onlineUsers.delete(user._id.toString());
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  });

  socket.on('typing:start', ({ to }) => {
    const toSocket = onlineUsers.get(to);
    if (toSocket) io.to(toSocket).emit('typing:start', { from: user._id });
  });

  socket.on('typing:stop', ({ to }) => {
    const toSocket = onlineUsers.get(to);
    if (toSocket) io.to(toSocket).emit('typing:stop', { from: user._id });
  });

  socket.on('message:send', async ({ to, text }) => {
    try {
      // conversation key sorted by userIds
      const members = [user._id.toString(), to].sort();
      let convo = await Conversation.findOne({ members });
      if (!convo) {
        convo = await Conversation.create({ members, lastMessageAt: new Date() });
      }
      const msg = await Message.create({
        conversation: convo._id,
        from: user._id,
        to,
        text,
        delivered: true,
        read: false
      });
      convo.lastMessage = text;
      convo.lastMessageAt = new Date();
      await convo.save();

      const payload = {
        _id: msg._id,
        conversation: convo._id,
        from: user._id.toString(),
        to,
        text,
        createdAt: msg.createdAt,
        delivered: true,
        read: false
      };

      // emit to sender
      socket.emit('message:new', payload);
      // emit to receiver if online
      const toSocket = onlineUsers.get(to);
      if (toSocket) {
        io.to(toSocket).emit('message:new', payload);
      }
    } catch (e) {
      console.error('message:send error', e);
    }
  });

  socket.on('message:read', async ({ withUserId }) => {
    try {
      const members = [user._id.toString(), withUserId].sort();
      const convo = await Conversation.findOne({ members });
      if (!convo) return;
      await Message.updateMany(
        { conversation: convo._id, to: user._id, read: false },
        { $set: { read: true } }
      );
      const otherSocket = onlineUsers.get(withUserId);
      if (otherSocket) {
        io.to(otherSocket).emit('message:read', { by: user._id.toString() });
      }
      socket.emit('message:read', { by: user._id.toString() });
    } catch (e) {
      console.error('message:read error', e);
    }
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: '*', credentials: true }));

app.get('/', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/conversations', messagesRouter);

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  httpServer.listen(PORT, () => console.log('Server listening on ' + PORT));
}).catch(err => {
  console.error('Mongo error', err);
});
