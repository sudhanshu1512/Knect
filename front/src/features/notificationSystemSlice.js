import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://knect.onrender.com";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notificationSystem/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching notifications...");
      const response = await axios.get(`${BASE_URL}/api/v1/notification-system`, {
        withCredentials: true
      });
      console.log("Notifications response:", response.data);
      return response.data.notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  "notificationSystem/markAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axios.put(`${BASE_URL}/api/v1/notification-system/mark-read`, {}, {
        withCredentials: true
      });
      return true;
    } catch (error) {
      console.error("Error marking notifications as read:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const notificationSystemSlice = createSlice({
  name: "notificationSystem",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch notifications";
        console.error("Notification fetch failed:", state.error);
      })
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true
        }));
      })
      .addCase(markNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to mark notifications as read";
        console.error("Mark as read failed:", state.error);
      });
  },
});

export const { addNotification, clearError } = notificationSystemSlice.actions;
export default notificationSystemSlice.reducer;
