import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, Divider, CircularProgress, alpha,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { loginThunk, registerThunk } from './authThunks';
import { clearAuthError, selectAuthError, selectAuthLoading, selectIsAuthenticated } from './authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    region: '',
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [mode, dispatch]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginThunk({ email: form.email, password: form.password }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      registerThunk({ email: form.email, password: form.password, full_name: form.full_name, region: form.region })
    );
    if (!result.error) {
      setRegisterSuccess(true);
      setTimeout(() => { setMode('login'); setRegisterSuccess(false); }, 2000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        background: 'linear-gradient(135deg, #F0F4F8 0%, #E8EDF5 50%, #EEF2FA 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
              boxShadow: '0 8px 24px rgba(21,101,192,0.35)',
              mb: 2,
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: '1.75rem' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            AI CRM
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Healthcare Professional Interaction Module
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Tab toggle */}
            <Box
              sx={{
                display: 'flex',
                gap: 0,
                mb: 3,
                p: 0.5,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                borderRadius: 2,
              }}
            >
              {['login', 'register'].map((m) => (
                <Button
                  key={m}
                  fullWidth
                  variant={mode === m ? 'contained' : 'text'}
                  onClick={() => setMode(m)}
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    ...(mode !== m && { color: 'text.secondary' }),
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </Button>
              ))}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
            {registerSuccess && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                Account created! Redirecting to sign in...
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={mode === 'login' ? handleLogin : handleRegister}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {mode === 'register' && (
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoFocus
                  size="medium"
                />
              )}

              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                size="medium"
                autoFocus={mode === 'login'}
                autoComplete="email"
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
                size="medium"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <VisibilityOffRoundedIcon fontSize="small" />
                          : <VisibilityRoundedIcon fontSize="small" />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {mode === 'register' && (
                <TextField
                  label="Region (optional)"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  placeholder="e.g. North India, Mumbai, Pan-India"
                />
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: '0.9375rem' }}
                startIcon={
                  isLoading ? <CircularProgress size={18} color="inherit" /> : <LockRoundedIcon />
                }
              >
                {isLoading
                  ? mode === 'login' ? 'Signing in...' : 'Creating account...'
                  : mode === 'login' ? 'Sign In' : 'Create Account'
                }
              </Button>
            </Box>

            {mode === 'login' && (
              <>
                <Divider sx={{ my: 2.5 }}>
                  <Typography variant="caption" color="text.secondary">Demo credentials</Typography>
                </Divider>
                <Box
                  sx={{
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                    border: '1px solid',
                    borderColor: (t) => alpha(t.palette.primary.main, 0.12),
                    borderRadius: 2,
                    p: 1.5,
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                  }}
                >
                  <div>Email: <strong>demo@aicrm.com</strong></div>
                  <div>Password: <strong>password123</strong></div>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 3 }}
        >
          AI-First CRM © 2026 — Healthcare Professional Module
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
