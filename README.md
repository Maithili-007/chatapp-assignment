# Chat App Assignment – React Native (Expo) + Node.js (Express + Socket.IO) + MongoDB

A minimal, stylish **1:1 real-time chat** with:
- JWT auth (register/login)
- User list with online/offline + last message
- Real-time messaging (Socket.IO)
- Typing indicator
- Delivery/read receipts
- Messages persisted in MongoDB

**Folders**
```
/server  -> Node.js + Express + Socket.IO backend
/mobile  -> Expo React Native frontend
```

## Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB connection string (MongoDB Atlas or local)
- (Mobile) Expo CLI: `npm i -g expo`

---

## 1) Backend – /server

### Setup
```bash
cd server
npm install
cp .env.example .env   # then fill values
npm run dev            # starts http://localhost:4000
```
The server exposes:
- REST:
  - `POST /auth/register` – body: `{ name, email, password }`
  - `POST /auth/login`    – body: `{ email, password }`
  - `GET  /users`         – (auth) list all users except current
  - `GET  /conversations/:id/messages` – (auth) messages with user `:id`
- Socket events:
  - `message:send`  – send a new message
  - `message:new`   – receive a new message
  - `typing:start` / `typing:stop`
  - `message:read`  – mark messages as read

### .env
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/chatapp    # or your Atlas URI
JWT_SECRET=supersecret_change_me
CLIENT_ORIGIN=http://localhost:19006           # Expo web dev URL (ok if absent)
```

> Tip: If your Expo dev URL is different, it’s fine; Socket.IO uses the server URL directly.

---

## 2) Mobile – /mobile (Expo)

### Setup & Run
```bash
cd mobile
npm install
# Create .env to point to your server:
cp .env.example .env
# Update API_URL (e.g. http://192.168.1.5:4000 for device on same Wi‑Fi)
npm start
# press 'a' for Android emulator, 'i' for iOS simulator, or scan QR with Expo Go
```

### .env (mobile)
```
API_URL=http://localhost:4000
```

> If you’re testing on a real phone, replace `localhost` with your **computer’s LAN IP**.

---

## Demo Flow (what to record)
1. Register two accounts (e.g., Alice and Bob)
2. Log in as Alice → see users → open Bob → send messages
3. Show real-time delivery, typing, read receipts
4. Log in as Bob on another device/simulator → chat in real time

---

## Notes
- For clarity, this is a compact MVP. You can expand validations, pagination, images, etc.
- UI is styled in a clean, soft card look inspired by your references.
- If MongoDB is not running, start it or use MongoDB Atlas and paste your URI.

Good luck! ✨
