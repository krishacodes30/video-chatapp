// import { Server } from "socket.io";

// export default function startSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"]
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("User connected", socket.id);

//     // send my socket id to frontend
//     socket.emit("me", socket.id);

//     // when someone calls another user
//     socket.on("callToUser", (data) => {
//       io.to(data.to).emit("callToUser", data); 
//     });

//     // when user accepts call
//     socket.on("answeredCall", (data) => {
//       io.to(data.to).emit("callAccepted", data);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//     });
//   });
// }
