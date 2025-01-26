import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/post/all", {
          withCredentials: true
        });
        if (res.data.success) {
          // Posts are already sorted by createdAt from backend
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
      }
    };
    fetchAllPost();
  }, [dispatch]); // Added dispatch to dependency array
};
export default useGetAllPost;
