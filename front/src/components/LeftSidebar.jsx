import { setAuthUser } from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import axios from "axios";
import {
  Home,
  MessageCircleHeart,
  LogOut,
  PlusSquare,
  Search,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreatePost from "./CreatePost";
import LogoutModal from "./LogoutModal";
import NotificationButton from "./Notification";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import image from "../assets/image.png";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        "https://knect.onrender.com/api/v1/user/logout",
        {
          withCredentials: true
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      setIsModalOpen(true);
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    } else if (textType === "Search") {
      navigate("/search");
    } else if (textType === "Explore") {
      navigate("/explore");
    }
    else if (textType === "Notification") {
      navigate("/notifications");
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircleHeart />, text: "Messages" },
    { component: <NotificationButton /> },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>{user?.username[0]}</AvatarFallback>
        </Avatar>
      ),
      text: "Profile"
    },
    { icon: <LogOut />, text: "Logout" }
  ];
  return (
    <div className="fixed  top-0 z-10 left-0 px-4 lg:border-r  border-gray-300 w-[16%] h-screen  ">
      <div className="flex flex-col">
      
                        <img src={image} alt="knect" className="w-16 h-16 sm:object-cover p-3 sm:block hidden" />
                    
        <div>
          {sidebarItems.map((item, index) => {
            return (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {item.component ? (
                  <div className="flex items-center gap-3 ">
                    {item.component}
                  </div>
                ) : (
                  <>
                  <div>
                     {item.icon}
                  </div>
                    <span className="sm:block hidden"> {item.text}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
      <LogoutModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} logoutHandler={logoutHandler} />
    </div>
  );
};

export default LeftSidebar;
