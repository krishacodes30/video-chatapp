// import { Server } from "socket.io";

// let io = null;

// // Stores online users:
// // key = userId (MongoDB _id)
// // value = { socketId, name, profilepic }
// const onlineUsers = new Map();

// /**
//  * Broadcast Online Users to all
//  */
// function broadcastOnlineUsers() {
//   const list = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
//     userId,
//     name: data.name,
//     profilepic: data.profilepic || "",
//     socketId: data.socketId,
//   }));

//   io.emit("online-users", list);
// }

// /**
//  * INITIALIZE SOCKET SERVER
//  */
// export const connectToSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("🔗 SOCKET CONNECTED:", socket.id);

//     // Send socket id to client
//     socket.emit("me", socket.id);

//     // -------------------------
//     // JOIN ROOM (Dashboard.jsx)
//     // socket.emit("join", { id: user._id, name: user.username });
//     // -------------------------
//     socket.on("join", ({ id, name, profilepic }) => {
//       onlineUsers.set(id, {
//         socketId: socket.id,
//         name,
//         profilepic,
//       });

//       socket.data.userId = id;

//       broadcastOnlineUsers();
//     });

//     // ---------------------------------------------------------
//     // CALL TO USER (Dashboard → startCall)
//     // ---------------------------------------------------------
//     socket.on("callToUser", (data) => {
//       const { callToUserId, signalData, from, name, email, profilepic } = data;

//       const target = onlineUsers.get(callToUserId);
//       if (!target) {
//         io.to(from).emit("userUnavailable", {
//           message: "User not available.",
//         });
//         return;
//       }

//       io.to(target.socketId).emit("callToUser", {
//         signal: signalData,
//         from, // caller socket id
//         name,
//         email,
//         profilepic,
//       });
//     });

//     // ---------------------------------------------------------
//     // ANSWERED CALL (Dashboard.jsx)
//     // socket.emit("answeredCall", { signal: data, from: me, to: caller.from })
//     // ---------------------------------------------------------
//     socket.on("answeredCall", ({ signal, from, to }) => {
//       io.to(to).emit("callAccepted", {
//         signal,
//         from,
//       });
//     });

//     // ---------------------------------------------------------
//     // REJECT CALL (Dashboard.jsx)
//     // ---------------------------------------------------------
//     socket.on("reject-call", ({ to, name, profilepic }) => {
//       io.to(to).emit("callRejected", {
//         name,
//         profilepic,
//       });
//     });

//     // ---------------------------------------------------------
//     // CALL ENDED (Dashboard.jsx)
//     // ---------------------------------------------------------
//     socket.on("call-ended", ({ to, name }) => {
//       io.to(to).emit("callEnded", { name });
//     });

//     // ---------------------------------------------------------
//     // ON DISCONNECT
//     // ---------------------------------------------------------
//     socket.on("disconnect", () => {
//       const userId = socket.data.userId;
//       if (userId && onlineUsers.has(userId)) {
//         onlineUsers.delete(userId);
//         broadcastOnlineUsers();
//       }
//       console.log("❌ DISCONNECTED:", socket.id);
//     });
//   });

//   return io;
// };
import { Server } from "socket.io";
import { Message } from "../models/message.model.js";  // ⭐ ADD THIS

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
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 SOCKET CONNECTED:", socket.id);

    socket.emit("me", socket.id);

    // USER JOINS
    socket.on("join", ({ id, name, profilepic }) => {
      onlineUsers.set(id, {
        socketId: socket.id,
        name,
        profilepic,
      });

      socket.data.userId = id;

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
