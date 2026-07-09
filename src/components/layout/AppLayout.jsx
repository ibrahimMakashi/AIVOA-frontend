import React, { useState } from 'react';
import { Box, Snackbar, Alert, Slide } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import TopBar from './TopBar';
import {
  selectNotifications,
  dismissNotification,
  removeNotification,
} from '../../features/notifications/notificationSlice';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/hcps': 'HCP Directory',
  '/interactions': 'Interaction History',
  '/log-interaction': 'Log Interaction',
  '/settings': 'Settings',
};

const SlideTransition = (props) => <Slide {...props} direction="down" />;

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const title = PAGE_TITLES[location.pathname] || 'AI CRM';

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // Shift left margin as sidebar animates
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 0,
        }}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} title={title} sidebarWidth={sidebarWidth} />

        {/*
          overflow: hidden here gives every child page a DEFINITE height
          (100vh - 60px topbar), so height:'100%' works correctly inside pages.
          Pages that need to scroll add overflowY:'auto' on their own root Box.
        */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            mt: '60px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            // Force routed pages (including Suspense wrappers) to fill
            // the available viewport height so inner panes can scroll independently.
            '& > *': {
              flex: 1,
              minHeight: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Global notification stack */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          autoHideDuration={notification.duration}
          onClose={() => dispatch(dismissNotification(notification.id))}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionProps={{
            onExited: () => dispatch(removeNotification(notification.id)),
          }}
        >
          <Alert
            onClose={() => dispatch(dismissNotification(notification.id))}
            severity={notification.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 280,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default AppLayout;
