import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Define notification interface
export interface Notification {
  message: string;
  type: "success" | "error" | "info" | "warning"; // more type safety
  time?: string; // stored as ISO string for mobile-friendly serialization
}

export interface NotificationState {
  messages: Notification[];
}

const initialState: NotificationState = {
  messages: [],
};

// ✅ Redux slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, "time">>) => {
      state.messages.push({
        ...action.payload,
        time: new Date().toISOString(),
      });
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.messages.length) {
        state.messages.splice(action.payload, 1);
      }
    },
    clearNotifications: (state) => {
      state.messages = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
