// import express from "express";
// import { createServer } from "node:http";//connect socket server nad app server

// import { Server } from "socket.io";

// import mongoose from "mongoose";
// import { connectToSocket } from "../backend/src/controllers/socketManager.js";


// import cors from "cors";
// import userRoutes from "../backend/src/routes/user.routes.js";
// import chatRoutes from "../backend/src/routes/chat.routes.js";


// const app = express();
// const server = createServer(app);
// const io = connectToSocket(server);
// app.get("/home",(req,res)=>{
//     return res.json({"hello":"kp"})
// })
// app.set("port", (process.env.PORT || 8000))
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json({ limit: "40kb" }));
// app.use(express.urlencoded({ limit: "40kb", extended: true }));

// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/chat", chatRoutes);
// const start = async () => {
//     app.set("mongo_user")
//     const connectionDb = await mongoose.connect("mongodb+srv://KRISHA:kpmongo@cluster0.0amlzaa.mongodb.net/?appName=Cluster0")

//     console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
// server.listen(app.get("port"), "0.0.0.0", () => {
//   console.log("Server running on 0.0.0.0:8000");
// });




// }



// start();
import "dotenv/config";
import express from "express";
import { createServer } from "node:http";//connect socket server nad app server

import { Server } from "socket.io";

import mongoose from "mongoose";
//import { connectToSocket } from "../backend/src/controllers/socketManager.js";


import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import { connectToSocket } from "./src/controllers/socketManager.js";



// import express from "express";
// import { createServer } from "http";
// import mongoose from "mongoose";
// import cors from "cors";

// import userRoutes from "./routes/user.routes.js";
// import chatRoutes from "./routes/chat.routes.js";
// import { connectToSocket } from "./controllers/socketManager.js";


const app = express();
const server = createServer(app);

// 🔌 Socket.IO
connectToSocket(server);
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});


// 🌍 Middleware
// app.use(cors({
//   origin: "*", // TEMP: allow all (we’ll lock later)
//   credentials: true
// }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://video-chatapp-frontend.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.options("*", cors());


app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true }));

// 🧪 Test route
app.get("/home", (req, res) => {
  res.json({ message: "Backend is running" });
});

// 🛣 Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chat", chatRoutes);

// 🚀 Start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

       server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();
