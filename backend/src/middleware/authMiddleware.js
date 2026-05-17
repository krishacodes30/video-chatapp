import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    try {
        // Reject any token sent in the body or query string
        if (req.body?.token || req.query?.token) {
            console.log(`❌ API AUTH FAILED: Token must be sent in Authorization header only for ${req.originalUrl}`);
            return res.status(401).json({ message: "Token must be sent in Authorization header only" });
        }

        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            console.log(`❌ API AUTH FAILED: Token missing for ${req.originalUrl}`);
            return res.status(401).json({ message: "Authorization header not provided" });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        if (!token) {
            console.log(`❌ API AUTH FAILED: Token missing after Bearer prefix for ${req.originalUrl}`);
            return res.status(401).json({ message: "Token not provided" });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from the decoded payload
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // store user for next controllers
        console.log(`✅ JWT VERIFIED FOR API: ${req.originalUrl} (User: ${user.username})`);
        next();          // GO to next controller
    } catch (e) {
        console.log(`❌ API AUTH FAILED: Invalid token for ${req.originalUrl}`);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
