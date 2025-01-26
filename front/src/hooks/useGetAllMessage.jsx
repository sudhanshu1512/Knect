import { setMessages } from "@/redux/chatSlice";
import api from "@/api/axios";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// Using named function for better debugging and Fast Refresh compatibility
export function useGetAllMessage() {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);

  return useCallback(async () => {
    if (!selectedUser?._id) {
      dispatch(setMessages([]));
      return;
    }

    try {
      const { data } = await api.get(`/message/all/${selectedUser._id}`);
      if (data.success) {
        dispatch(setMessages(data.messages || []));
        return data.messages;
      } else {
        console.error("Failed to fetch messages:", data);
        toast.error("Failed to load messages");
        dispatch(setMessages([]));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      dispatch(setMessages([]));
    }
  }, [selectedUser?._id, dispatch]);
}

export default useGetAllMessage;