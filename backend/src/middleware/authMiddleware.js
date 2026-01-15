import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"


//import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        // Token will come from headers → req.headers.authorization
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "Token not provided" });
        }

        // Find user with this token
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = user; // store user for next controllers
        next();          // GO to next controller
    } catch (e) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
