import { setSelectedUser } from "@/redux/authSlice";
import { setMessages } from "@/redux/chatSlice";
import api from '@/api/axios';
import { ArrowLeft, Image, Info, Phone, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Messages from "./Messages";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { debounce } from "lodash";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, selectedUser } = useSelector((store) => store.auth);
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/user/chat");
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/user/chat/search?query=${query}`);
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => searchUsers(query), 500),
    [searchUsers]
  );

  useEffect(() => {
    fetchUsers();
    return () => {
      dispatch(setSelectedUser(null));
      dispatch(setMessages([]));
    };
  }, [dispatch]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleUserSelect = useCallback((selectedUser) => {
    dispatch(setSelectedUser(selectedUser));
    dispatch(setMessages([]));
  }, [dispatch]);

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;
    
    const messageToSend = textMessage.trim();
    setTextMessage(""); // Clear input immediately for better UX
    
    try {
      const { data } = await api.post(`/message/send/${receiverId}`, { 
        textMessage: messageToSend  
      });
      
      if (data.success) {
        dispatch(setMessages([...messages, data.newMessage]));
      } else {
        // If the request failed, show error and restore the message text
        setTextMessage(messageToSend);
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setTextMessage(messageToSend); // Restore message text on error
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white">
      {!selectedUser ? (
        <>
          {/* Chat List Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="mr-1"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-lg font-semibold">{user?.username}</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Image className="h-5 w-5 rotate-90" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-2">
            <Input
              placeholder="Search"
              className="w-full bg-gray-100 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Messages Label */}
          <div className="px-4 py-2">
            <h2 className="font-semibold">Messages</h2>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? "No users found" : "No messages yet"}
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleUserSelect(u)}
                >
                  <div className="relative mr-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={u.profilePicture} />
                      <AvatarFallback>{u.username[0]}</AvatarFallback>
                    </Avatar>
                    {onlineUsers.includes(u._id) && (
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{u.username}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {onlineUsers.includes(u._id) ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                dispatch(setSelectedUser(null));
                dispatch(setMessages([]));
              }}
              className="mr-3"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={selectedUser.profilePicture} />
              <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{selectedUser.username}</h3>
              <p className="text-sm text-gray-500 truncate">
                {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white px-4">
            <Messages />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Input
                placeholder="Message..."
                className="flex-1 bg-transparent border-none focus:outline-none"
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessageHandler(selectedUser._id);
                  }
                }}
              />
              {textMessage.trim() ? (
                <Button 
                  onClick={() => sendMessageHandler(selectedUser._id)}
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 p-0 h-auto font-semibold"
                >
                  Send
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="p-0 h-auto">
                  <Image className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;
