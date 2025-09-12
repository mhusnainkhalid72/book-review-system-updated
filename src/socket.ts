import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export let io: Server;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Join room by userId
    socket.on("joinRoom", (roomId: string) => {
      try {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      } catch (err) {
        console.error("Error joining room:", err);
      }
    });

    // Chat messages (admin <-> user)
    socket.on("sendMessage", async (data) => {
      const { toUserId } = data;
      try {
        const roomSockets = io.sockets.adapter.rooms.get(toUserId);
        if (!roomSockets || roomSockets.size === 0) {
          console.log(`User ${toUserId} is offline. Message will be saved in DB.`);
        }
        io.to(toUserId).emit("sendMessage", data);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
