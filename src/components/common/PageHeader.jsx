import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        pt: 3,
        pb: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon sx={{ fontSize: '0.9rem' }} />}
            sx={{ mb: 0.75 }}
          >
            {breadcrumbs.map((crumb, i) =>
              crumb.href ? (
                <Link
                  key={i}
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate(crumb.href)}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={i} sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }}>
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{actions}</Box>}
    </Box>
  );
};

export default PageHeader;
