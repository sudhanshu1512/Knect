import { setUserProfile } from "@/redux/authSlice";
import api from "@/api/axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get(`/user/${userId}/profile`);
        if (data.success) {
          dispatch(setUserProfile(data.user));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, dispatch]);
};

export default useGetUserProfile;
