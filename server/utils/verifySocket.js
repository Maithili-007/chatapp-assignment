
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function verifySocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return next(new Error('Bad token user'));
    socket.user = { _id: user._id, name: user.name, email: user.email };
    next();
  } catch (e) {
    next(new Error('Auth failed'));
  }
}
