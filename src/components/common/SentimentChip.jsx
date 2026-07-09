import React from 'react';
import { Chip } from '@mui/material';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import SentimentNeutralRoundedIcon from '@mui/icons-material/SentimentNeutralRounded';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';

const CONFIG = {
  positive: {
    label: 'Positive',
    icon: <SentimentSatisfiedAltRoundedIcon />,
    color: 'success',
    sx: { bgcolor: '#E8F5E9', color: '#2E7D32', borderColor: '#C8E6C9' },
  },
  neutral: {
    label: 'Neutral',
    icon: <SentimentNeutralRoundedIcon />,
    color: 'default',
    sx: { bgcolor: '#F5F5F5', color: '#546E7A', borderColor: '#E0E0E0' },
  },
  negative: {
    label: 'Negative',
    icon: <SentimentVeryDissatisfiedRoundedIcon />,
    color: 'error',
    sx: { bgcolor: '#FFEBEE', color: '#C62828', borderColor: '#FFCDD2' },
  },
};

const SentimentChip = ({ value, size = 'small' }) => {
  const config = CONFIG[value] || CONFIG.neutral;
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 500, ...config.sx, '& .MuiChip-icon': { color: 'inherit' } }}
    />
  );
};

export default SentimentChip;
