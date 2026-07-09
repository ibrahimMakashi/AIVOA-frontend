import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../../utils/constants';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/v1/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

      // Fetch the user profile after login using the token
      const { data: userData } = await api.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return { accessToken: data.access_token, user: userData };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Invalid email or password.'
      );
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password, full_name, region }, { rejectWithValue }) => {
    try {
      await api.post('/api/v1/auth/register', { email, password, full_name, region });
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed.'
      );
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await api.post('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });
      return data.access_token;
    } catch {
      return rejectWithValue('Session expired.');
    }
  }
);
