import { Router } from "express";
import { getChatHistory } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id", authMiddleware, getChatHistory);

export default router;
