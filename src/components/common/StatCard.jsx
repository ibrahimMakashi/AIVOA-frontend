import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, alpha } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

const StatCard = ({ title, value, icon, trend, trendLabel, color = 'primary', loading = false }) => {
  const colors = {
    primary: { bg: '#EBF3FB', icon: '#1565C0' },
    success: { bg: '#E8F5E9', icon: '#2E7D32' },
    warning: { bg: '#FFF3E0', icon: '#E65100' },
    error:   { bg: '#FFEBEE', icon: '#C62828' },
    info:    { bg: '#E1F5FE', icon: '#0277BD' },
    ai:      { bg: '#E0F7F4', icon: '#00897B' },
  };
  const c = colors[color] || colors.primary;
  const isPositive = trend > 0;
  const TrendIcon = isPositive ? TrendingUpRoundedIcon : TrendingDownRoundedIcon;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: c.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: c.icon, fontSize: '1.375rem' } })}
          </Box>
          {trend !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1,
                py: 0.25,
                borderRadius: 5,
                bgcolor: isPositive ? '#E8F5E9' : '#FFEBEE',
                height: 'fit-content',
              }}
            >
              <TrendIcon sx={{ fontSize: '0.875rem', color: isPositive ? '#2E7D32' : '#C62828' }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: isPositive ? '#2E7D32' : '#C62828' }}
              >
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        {loading ? (
          <>
            <Skeleton variant="text" width="60%" height={36} />
            <Skeleton variant="text" width="80%" />
          </>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}
            >
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trendLabel && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {trendLabel}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
