import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
  },
  reducers: {
    showNotification: (state, action) => {
      state.items.push({
        id: nextId++,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        duration: action.payload.duration || 4000,
        open: true,
      });
    },
    dismissNotification: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.open = false;
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
  },
});

export const { showNotification, dismissNotification, removeNotification } =
  notificationSlice.actions;

export const notifySuccess = (message) =>
  showNotification({ message, severity: 'success' });

export const notifyError = (message) =>
  showNotification({ message, severity: 'error', duration: 6000 });

export const notifyInfo = (message) =>
  showNotification({ message, severity: 'info' });

export const notifyWarning = (message) =>
  showNotification({ message, severity: 'warning' });

export const selectNotifications = (state) => state.notifications.items;

export default notificationSlice.reducer;
