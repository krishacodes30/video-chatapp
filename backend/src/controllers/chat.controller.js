import { Message } from "../models/message.model.js";

export const getChatHistory = async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.id;

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId }
    ]
  }).sort({ timestamp: 1 });

  res.json({ success: true, messages });
};
