import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { fetchNotifications, markNotificationsAsRead } from "../features/notificationSystemSlice";

const NotificationButton = () => {
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

  console.log("Current notifications state:", { notifications, loading, error, unreadCount });

  return (
    <div className="relative">
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-4 hover:bg-gray-100 py-6"
          >
            <Heart />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <div className="absolute bottom-6 left-6 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs">
                {unreadCount}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-[400px] overflow-y-auto">
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
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.sender?.profilePicture} />
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
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationButton;
