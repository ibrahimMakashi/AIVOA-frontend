import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Box,
  Tooltip, Avatar, Menu, MenuItem, Divider, ListItemIcon, alpha,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { SIDEBAR_WIDTH } from './Sidebar';

const TopBar = ({ onMenuClick, title, sidebarWidth = SIDEBAR_WIDTH }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
        <IconButton
          onClick={onMenuClick}
          sx={{ mr: 1, display: { md: 'none' } }}
          size="small"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ fontWeight: 600, fontSize: '1rem', flexGrow: 1, color: 'text.primary' }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <NotificationsNoneRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                }}
              >
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => { navigate('/settings'); setAnchorEl(null); }}
            sx={{ py: 1 }}
          >
            <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
            Profile & Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1, color: 'error.main' }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
