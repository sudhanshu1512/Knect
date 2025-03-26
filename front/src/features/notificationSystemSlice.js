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
      const response = await axios.get(`${BASE_URL}/api/v1/notification-system`, {
        withCredentials: true
      });
      return response.data.notifications;
    } catch (error) {
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
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notificationSystem/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/v1/notification-system/${notificationId}`, {
        withCredentials: true
      });
      return notificationId;
    } catch (error) {
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
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch notifications";
      })
      // Mark as read
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true
        }));
      })
      .addCase(markNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to mark notifications as read";
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          notification => notification._id !== action.payload
        );
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete notification";
      });
  },
});

export const { addNotification, clearError } = notificationSystemSlice.actions;
export default notificationSystemSlice.reducer;
