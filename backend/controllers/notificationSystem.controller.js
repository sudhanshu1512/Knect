import { NotificationSystem } from "../models/notificationSystem.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.id;
    const notifications = await NotificationSystem.find({ recipient: userId })
      .populate("sender", "username profilePicture")
      .populate("postId", "image")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ notifications, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.id;
    await NotificationSystem.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
    res.status(200).json({ message: "Notifications marked as read", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { recipientId, senderId, postId, type } = req.body;
    
    const notification = new NotificationSystem({
      recipient: recipientId,
      sender: senderId,
      postId,
      type,
    });
    
    await notification.save();
    
    const populatedNotification = await NotificationSystem.findById(notification._id)
      .populate("sender", "username profilePicture")
      .populate("postId", "image");
      
    res.status(201).json({ notification: populatedNotification, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
