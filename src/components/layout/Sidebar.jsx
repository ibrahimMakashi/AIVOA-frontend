import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, Tooltip, alpha, IconButton,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
  { label: 'HCP Directory', icon: <PeopleRoundedIcon />, path: '/hcps' },
  { label: 'Interactions', icon: <EventNoteRoundedIcon />, path: '/interactions' },
  { label: 'Log Interaction', icon: <AddCircleRoundedIcon />, path: '/log-interaction', highlight: true },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
];

const NavItem = ({ item, active, collapsed }) => {
  const navigate = useNavigate();
  return (
    <ListItem disablePadding sx={{ px: collapsed ? 0.75 : 1.5, mb: 0.25 }}>
      <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
        <ListItemButton
          selected={active}
          onClick={() => navigate(item.path)}
          sx={{
            borderRadius: 2,
            py: 1,
            px: collapsed ? 1 : 1.5,
            justifyContent: collapsed ? 'center' : 'flex-start',
            minWidth: 0,
            transition: 'all 0.15s ease',
            ...(item.highlight && !active && {
              background: (t) => alpha(t.palette.primary.main, 0.06),
              '&:hover': { background: (t) => alpha(t.palette.primary.main, 0.1) },
            }),
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 'unset' : 36,
              color: active ? 'primary.main' : item.highlight ? 'primary.main' : 'text.secondary',
              '& svg': { fontSize: '1.25rem' },
            }}
          >
            {item.icon}
          </ListItemIcon>

          {!collapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                color: active ? 'primary.main' : 'text.primary',
                noWrap: true,
              }}
            />
          )}

          {!collapsed && item.highlight && !active && (
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', ml: 0.5 }} />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

export const SidebarContent = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Brand + toggle */}
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 1.5,
          justifyContent: collapsed ? 'center' : 'flex-start',
          position: 'relative',
          minHeight: 60,
        }}
      >
        <Tooltip title={collapsed ? 'AI CRM' : ''} placement="right">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(21,101,192,0.35)',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: '1.1rem' }} />
          </Box>
        </Tooltip>

        {!collapsed && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              AI CRM
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              HCP Module
            </Typography>
          </Box>
        )}

        {/* Collapse toggle — sits on the right edge */}
        {onToggleCollapse && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                position: collapsed ? 'static' : 'absolute',
                right: collapsed ? undefined : 6,
                width: 26,
                height: 26,
                mt: collapsed ? 1 : 0,
                bgcolor: (t) => alpha(t.palette.divider, 0.6),
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08) },
                ...(collapsed && { display: 'none' }),
              }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mx: collapsed ? 0.75 : 2, mb: 1 }} />

      {/* Main Nav */}
      <List sx={{ flex: 1, px: 0, py: 0.5 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            collapsed={collapsed}
          />
        ))}
      </List>

      <Divider sx={{ mx: collapsed ? 0.75 : 2, mb: 1 }} />

      {/* Bottom Nav */}
      <List sx={{ px: 0, py: 0.5 }}>
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            collapsed={collapsed}
          />
        ))}
      </List>

      {/* Expand button (only visible when collapsed) */}
      {collapsed && onToggleCollapse && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                width: 32,
                height: 32,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.primary.main, 0.15),
                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12) },
              }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* User profile */}
      <Box
        sx={{
          mx: collapsed ? 0.75 : 1.5,
          mb: 2,
          mt: 0.5,
          p: collapsed ? 0.75 : 1.5,
          borderRadius: 2,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
          border: '1px solid',
          borderColor: (t) => alpha(t.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 1.25,
        }}
      >
        <Tooltip title={collapsed ? `${user?.full_name || 'User'} · ${user?.role || 'Med Rep'}` : ''} placement="right">
          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: '0.8125rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
              flexShrink: 0,
            }}
          >
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </Tooltip>

        {!collapsed && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}
              noWrap
            >
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              {user?.role || 'Med Rep'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onClose, collapsed, onToggleCollapse }) => {
  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            border: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
          },
        }}
      >
        <SidebarContent collapsed={false} />
      </Drawer>

      {/* Desktop permanent drawer — animates width on collapse */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopWidth,
          flexShrink: 0,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: desktopWidth,
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        open
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </Drawer>
    </>
  );
};

export default Sidebar;
