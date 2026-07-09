/**
 * StreamingField — wraps any form field and adds AI-fill visual effects.
 *
 * Status transitions:
 *   idle     → normal field, no indicator
 *   filling  → animated green border pulse (AI is writing this field)
 *   filled   → solid green left-border + "AI" chip (AI has finished)
 *   error    → red border (extraction failed)
 *
 * The component is purely presentational — all state lives in Redux aiSlice.
 */

import React from 'react';
import { Box, Chip, Tooltip, alpha, keyframes } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const pulseGreen = keyframes`
  0%   { box-shadow: 0 0 0 0   rgba(0, 176, 155, 0.4); }
  70%  { box-shadow: 0 0 0 6px rgba(0, 176, 155, 0);   }
  100% { box-shadow: 0 0 0 0   rgba(0, 176, 155, 0);   }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const StreamingField = ({ children, status = 'idle', aiGenerated = false, label = '' }) => {
  const isFilling = status === 'filling';
  const isFilled = status === 'filled' && aiGenerated;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* AI chip badge */}
      {isFilled && (
        <Tooltip title={`"${label}" was populated by AI`} arrow placement="top-end">
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '0.75rem !important' }} />}
            label="AI Filled"
            size="small"
            sx={{
              position: 'absolute',
              top: -11,
              right: 10,
              zIndex: 2,
              height: 22,
              px: 0.25,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, rgba(0,176,155,0.12) 0%, rgba(0,137,123,0.18) 100%)',
              color: '#00796B',
              border: '1px solid',
              borderColor: 'rgba(0,176,155,0.22)',
              boxShadow: '0 6px 14px rgba(0,176,155,0.12)',
              backdropFilter: 'blur(8px)',
              animation: `${slideIn} 0.3s ease`,
              '& .MuiChip-icon': { color: '#00897B' },
            }}
          />
        </Tooltip>
      )}

      {/* Wrapper with status-driven border styles */}
      <Box
        sx={{
          borderRadius: 3,
          transition: 'all 0.28s ease',
          position: 'relative',

          // Filling: animated pulse border
          ...(isFilling && {
            animation: `${pulseGreen} 1.2s ease-in-out infinite`,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 3,
              pointerEvents: 'none',
              background: 'linear-gradient(90deg, rgba(0,176,155,0) 0%, rgba(0,176,155,0.10) 30%, rgba(0,176,155,0.22) 50%, rgba(0,176,155,0.10) 70%, rgba(0,176,155,0) 100%)',
              backgroundSize: '200% 100%',
              animation: `${shimmer} 1.5s linear infinite`,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00B09B !important',
              borderWidth: '2px !important',
            },
            '& .MuiInputBase-root': {
              bgcolor: 'rgba(0,176,155,0.03) !important',
            },
          }),

          // Filled: green left accent
          ...(isFilled && {
            borderLeft: '4px solid #00B09B',
            pl: 0.65,
            borderRadius: '0 12px 12px 0',
            animation: `${slideIn} 0.3s ease`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: (t) => `${alpha(t.palette.secondary.main, 0.35)} !important`,
            },
            '& .MuiInputBase-root': {
              bgcolor: (t) => `${alpha('#00B09B', 0.04)} !important`,
            },
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default StreamingField;
