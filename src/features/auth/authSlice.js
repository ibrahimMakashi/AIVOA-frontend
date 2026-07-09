import { createSlice } from '@reduxjs/toolkit';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../../utils/constants';
import { loginThunk, refreshTokenThunk, registerThunk } from './authThunks';

const loadPersistedAuth = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (token && user) return { token, user: JSON.parse(user) };
  } catch {
    /* ignore parse errors */
  }
  return { token: null, user: null };
};

const { token: persistedToken, user: persistedUser } = loadPersistedAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser,
    accessToken: persistedToken,
    isAuthenticated: !!persistedToken,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setTokenFromRefresh: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed.';
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed.';
      });

    // Token refresh
    builder.addCase(refreshTokenThunk.fulfilled, (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    });
  },
});

export const { logout, clearAuthError, setTokenFromRefresh } = authSlice.actions;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
