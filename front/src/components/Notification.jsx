import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { fetchNotifications, markNotificationsAsRead, deleteNotification } from "../features/notificationSystemSlice";
import { toast } from "sonner";

const Notification = () => {
  const dispatch = useDispatch();
  const { notifications = [], loading, error } = useSelector((state) => state.notificationSystem || { notifications: [], loading: false, error: null });
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    console.log("NotificationButton mounted");
    dispatch(fetchNotifications())
      .unwrap()
      .then(data => console.log("Notifications fetched:", data))
      .catch(err => console.error("Error fetching notifications:", err));
  }, [dispatch]);

  const handleOpenChange = (open) => {
    if (open && unreadCount > 0) {
      dispatch(markNotificationsAsRead())
        .unwrap()
        .then(() => console.log("Notifications marked as read"))
        .catch(err => console.error("Error marking as read:", err));
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  console.log("Current notifications state:", { notifications, loading, error, unreadCount });

  return (
    <div className="flex items-center gap-3">
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-3">
            <Bell className="" />
            <span className="sm:block hidden">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                {unreadCount}
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 ml-2 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {error ? (
              <p className="text-center text-red-500 py-4">Error: {error}</p>
            ) : loading ? (
              <p className="text-center text-gray-500 py-4">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.sender?.profilePicture} alt={notification.sender?.username} />
                    <AvatarFallback>
                      {notification.sender?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {notification.sender?.username}
                      </span>{" "}
                      {notification.type === "like"
                        ? "liked your post"
                        : notification.type === "comment"
                        ? "commented on your post"
                        : "followed you"}
                    </p>
                  </div>
                  {notification.postId?.image && (
                    <div className="h-10 w-10 rounded overflow-hidden">
                      <img
                        src={notification.postId.image}
                        alt="Post"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 h-6 w-6 p-0.5 hover:bg-red-100 hover:text-red-500"
                    onClick={() => handleDeleteNotification(notification._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Notification;
