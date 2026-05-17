
import { Server } from "socket.io";
import { Message } from "../models/message.model.js";  // ⭐ ADD THIS
import jwt from "jsonwebtoken";

let io = null;

const onlineUsers = new Map();

function broadcastOnlineUsers() {
  const list = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
    userId,
    name: data.name,
    profilepic: data.profilepic || "",
    socketId: data.socketId,
  }));

  io.emit("online-users", list);
}

export const connectToSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://video-chatapp-frontend.onrender.com"
      ],
      methods: ["GET", "POST"],
      credentials: true,

      allowedHeaders: ["Authorization", "Content-Type"],
    },
  });

  io.use((socket, next) => {
    try {

      const authHeader = socket.handshake.headers.authorization ?? "";

      if (!authHeader.startsWith("Bearer ")) {
        console.log("❌ SOCKET AUTH FAILED: Missing or malformed Authorization header");
        return next(new Error("Authentication error: Authorization header required"));
      }

      const token = authHeader.slice(7); // strip "Bearer "

      if (!token) {
        console.log("❌ SOCKET AUTH FAILED: Empty token");
        return next(new Error("Authentication error: token is empty"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.id;

      console.log(
        `✅ JWT VERIFIED FOR SOCKET: ${socket.id} | USER: ${decoded.id} | transport: ${socket.handshake.query.transport}`
      );

      next();
    } catch (err) {
      console.log("❌ SOCKET AUTH FAILED: Invalid or expired token —", err.message);
      return next(new Error("Authentication error: invalid or expired token"));
    }
  });



  io.on("connection", (socket) => {
    console.log("🔗 SOCKET CONNECTED:", socket.id);

    socket.emit("me", socket.id);

    // USER JOINS
    socket.on("join", ({ name, profilepic }) => {
      const verifiedUserId = socket.data.userId; // Use securely verified ID
      onlineUsers.set(verifiedUserId, {
        socketId: socket.id,
        name,
        profilepic,
      });

      broadcastOnlineUsers();
    });



    socket.on("join-chat", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.join(room);

    });



    // -----------------------------
    // 📞 VIDEO CALL FEATURE
    // -----------------------------
    socket.on("callToUser", (data) => {
      const { callToUserId, signalData, from, name, email, profilepic } = data;

      const target = onlineUsers.get(callToUserId);
      if (!target) {
        io.to(from).emit("userUnavailable", {
          message: "User not available.",
        });
        return;
      }

      io.to(target.socketId).emit("callToUser", {
        signal: signalData,
        from,
        name,
        email,
        profilepic,
      });
    });

    socket.on("answeredCall", ({ signal, from, to }) => {
      io.to(to).emit("callAccepted", {
        signal,
        from,
      });
    });

    socket.on("reject-call", ({ to, name, profilepic }) => {
      io.to(to).emit("callRejected", {
        name,
        profilepic,
      });
    });

    socket.on("call-ended", ({ to, name }) => {
      io.to(to).emit("callEnded", { name });
    });

    socket.on("send-message", async (msg) => {
      try {
        const { senderId, receiverId, message } = msg;

        const saved = await Message.create({ senderId, receiverId, message });

        const room = [senderId, receiverId].sort().join("_");

        io.to(room).emit("receive-message", saved);

      } catch (err) {
        console.log("Message Save Error:", err);
      }
    });





    // DISCONNECT
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        broadcastOnlineUsers();
      }
      console.log("❌ DISCONNECTED:", socket.id);
    });
  });

  return io;
};
