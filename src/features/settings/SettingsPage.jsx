import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Avatar, Divider, Grid, Alert, CircularProgress, alpha,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { selectCurrentUser, logout } from '../auth/authSlice';
import useNotification from '../../hooks/useNotification';
import PageHeader from '../../components/common/PageHeader';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const notify = useNotification();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    region: user?.region || '',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = () => notify.success('Profile updated (demo — connect to PUT /api/v1/users/me).');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto', width: '100%', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and preferences"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '1rem' }}>
                Profile Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.role?.replace('_', ' ').toUpperCase()}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  disabled
                  helperText="Email cannot be changed."
                />
                <TextField
                  label="Region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="e.g. North India, Mumbai"
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSave}>
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                AI Model
              </Typography>
              <Box sx={{ p: 1.5, bgcolor: (t) => alpha(t.palette.secondary.main, 0.06), borderRadius: 2, border: '1px solid', borderColor: (t) => alpha(t.palette.secondary.main, 0.15) }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  Groq — gemma2-9b-it
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Powering AI extraction and suggestions
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Account
              </Typography>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<LogoutRoundedIcon />}
                onClick={handleLogout}
                sx={{ fontWeight: 600 }}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
