import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  createNotification,
  deleteNotification 
} from "../controllers/notificationSystem.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotifications);
router.put("/mark-read", isAuthenticated, markAsRead);
router.post("/", isAuthenticated, createNotification);
router.delete("/:notificationId", isAuthenticated, deleteNotification);

export default router;
