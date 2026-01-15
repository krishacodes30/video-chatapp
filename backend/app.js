import express from "express";
import { createServer } from "node:http";//connect socket server nad app server

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "../backend/src/controllers/socketManager.js";


import cors from "cors";
import userRoutes from "../backend/src/routes/user.routes.js";
import chatRoutes from "../backend/src/routes/chat.routes.js";


const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.get("/home",(req,res)=>{
    return res.json({"hello":"kp"})
})
app.set("port", (process.env.PORT || 8000))
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chat", chatRoutes);
const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://KRISHA:kpmongo@cluster0.0amlzaa.mongodb.net/?appName=Cluster0")

    console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
server.listen(app.get("port"), "0.0.0.0", () => {
  console.log("Server running on 0.0.0.0:8000");
});




}



start();