import { useEffect, useRef, memo, useState } from "react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format, isValid, parseISO } from "date-fns";
import { useGetAllMessage } from "@/hooks/useGetAllMessage";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import useGetRTM from "@/hooks/useGetRTM";

const MessageBubble = memo(({ message, isOwnMessage, selectedUser, time }) => (
  <div
    className={cn(
      "flex items-end gap-2",
      isOwnMessage ? "justify-end" : "justify-start"
    )}
  >
    {!isOwnMessage && (
      <Avatar className="h-6 w-6">
        <AvatarImage src={selectedUser?.profilePicture} />
        <AvatarFallback>{selectedUser?.username?.[0]}</AvatarFallback>
      </Avatar>
    )}
    <div
      className={cn(
        "max-w-[65%] break-words px-4 py-2 text-[15px] leading-[18px]",
        isOwnMessage
          ? "bg-[#0095F6] text-white rounded-[22px] rounded-br-[4px]"
          : "bg-gray-100 text-black rounded-[22px] rounded-bl-[4px]"
      )}
    >
      {message.message || message.text}
    </div>
    {time && (
      <span className="text-[11px] text-gray-500 min-w-[45px]">
        {time}
      </span>
    )}
  </div>
));

MessageBubble.displayName = 'MessageBubble';

const DateSeparator = memo(({ date }) => (
  <div className="flex justify-center">
    <span className="text-xs text-gray-500 bg-white px-4">{date}</span>
  </div>
));

DateSeparator.displayName = 'DateSeparator';

const Messages = () => {
  
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedUser, user } = useSelector((store) => store.auth);
  const { messages } = useSelector((store) => store.chat);
  const fetchMessages = useGetAllMessage();
  useGetRTM();

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (!selectedUser?._id || !isMounted) return;
      setIsLoading(true);
      try {
        await fetchMessages();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedUser?._id, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageDate = (dateString) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(date)) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatMessageTime = (dateString) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(date)) {
        console.error('Invalid time:', dateString);
        return '';
      }
      return format(date, "h:mm a");
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      // Use current time for messages without createdAt
      const messageDate = message?.createdAt ? message.createdAt : new Date().toISOString();
      const dateKey = formatMessageDate(messageDate);
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push({
        ...message,
        createdAt: messageDate
      });
    });
    return groups;
  };

  if (!selectedUser || !user) {
    return null;
  }

  const groupedMessages = groupMessagesByDate(messages || []);

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Profile Info */}
      <div className="flex flex-col items-center justify-center pt-4 pb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={selectedUser?.profilePicture} />
          <AvatarFallback>{selectedUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{selectedUser?.username}</h3>
        <Link 
          to={`/profile/${selectedUser?._id}`}
          className="mt-2"
        >
          <Button 
            variant="outline" 
            size="sm"
            className="text-sm"
          >
            View Profile
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <div className="space-y-6 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <DateSeparator date={date} />
              <div className="space-y-1">
                {dateMessages.map((message) => {
                  if (!message?._id) {
                    console.warn('Invalid message object:', message);
                    return null;
                  }

                  const isOwnMessage = message.senderId === user._id;
                  const time = formatMessageTime(message.createdAt);

                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      selectedUser={selectedUser}
                      time={time}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;