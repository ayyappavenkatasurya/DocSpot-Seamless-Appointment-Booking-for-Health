import { configureStore } from '@reduxjs/toolkit';
import { alertSlice } from './alertSlice';
import { userSlice } from './userSlice';

export default configureStore({
  reducer: {
    alerts: alertSlice.reducer,
    user: userSlice.reducer,
  },
});