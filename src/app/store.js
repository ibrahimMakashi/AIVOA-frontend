import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import hcpReducer from '../features/hcp/hcpSlice';
import interactionReducer from '../features/interactions/interactionSlice';
import aiReducer from '../features/ai/aiSlice';
import notificationReducer from '../features/notifications/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    hcp: hcpReducer,
    interactions: interactionReducer,
    ai: aiReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // SSE queue objects are not serializable — exclude from checks
      serializableCheck: {
        ignoredActions: ['ai/sseEventReceived'],
      },
    }),
});

export default store;
