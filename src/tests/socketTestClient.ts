import { io, Socket } from "socket.io-client";

// Server URL
const SERVER_URL = "http://localhost:5001";

// Dummy IDs for testing
const USER_ID = "68c4091157130218685d0def"; // Replace with actual userId from DB
const ADMIN_ID = "adminRoom";

// ------------------ USER CLIENT ------------------
const userSocket: Socket = io(SERVER_URL, { reconnection: true });

userSocket.on("connect", () => {
  console.log("[USER] Connected with socket ID:", userSocket.id);

  // Join user's personal room
  userSocket.emit("joinRoom", USER_ID);
  console.log(`[USER] Joined room: ${USER_ID}`);
});

// Listen for messages from admin
userSocket.on("sendMessage", (data) => {
  console.log("[USER] Received message:", data);
});

// Keep user online by sending heartbeat every 15s
setInterval(() => {
  if (userSocket.connected) {
    userSocket.emit("heartbeat", { userId: USER_ID });
  }
}, 15000);

// ------------------ ADMIN CLIENT ------------------
const adminSocket: Socket = io(SERVER_URL, { reconnection: true });

adminSocket.on("connect", () => {
  console.log("[ADMIN] Connected with socket ID:", adminSocket.id);

  // Join admin room
  adminSocket.emit("joinRoom", ADMIN_ID);
  console.log(`[ADMIN] Joined room: ${ADMIN_ID}`);

  // Send a test message to user after 2 sec
  setTimeout(() => {
    adminSocket.emit("sendMessage", {
      fromUserId: ADMIN_ID,
      toUserId: USER_ID,
      reviewId: "68c40b4357130218685d0e1d",
      message: "Hello User! Admin is sending a test message.",
    });
    console.log("[ADMIN] Sent message to User");
  }, 2000);
});

// Listen for messages from user
adminSocket.on("sendMessage", (data) => {
  console.log("[ADMIN] Received message from user:", data);
});

// Keep admin online
setInterval(() => {
  if (adminSocket.connected) {
    adminSocket.emit("heartbeat", { userId: ADMIN_ID });
  }
}, 15000);
