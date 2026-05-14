import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    try {
        // Token will come from headers → req.headers.authorization
        const token = req.headers.authorization;

        if (!token) {
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
        next();          // GO to next controller
    } catch (e) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
