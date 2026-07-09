import React, { useCallback, useRef, useState } from 'react';
import { Box, Typography, Chip, alpha } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AIChatPanel from './AIChatPanel';
import InteractionFormPanel from './InteractionFormPanel';

const MIN_FORM_WIDTH = 380;
const MIN_AI_WIDTH = 300;
const DEFAULT_AI_WIDTH = 400;

/**
 * LogInteractionPage — split layout with independent scroll regions.
 *
 * [Form column — scrolls internally] | [Divider] | [AI column — fixed height, chat scrolls inside]
 *
 * The page itself never scrolls; only the form body and chat messages scroll.
 */
const LogInteractionPage = () => {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(DEFAULT_AI_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  const onDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);

    const onMouseMove = (moveEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newAiWidth = rect.right - moveEvent.clientX;
      const maxAiWidth = rect.width - MIN_FORM_WIDTH;
      setAiPanelWidth(Math.max(MIN_AI_WIDTH, Math.min(maxAiWidth, newAiWidth)));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >


      {/* Split area — fills remaining viewport height, no page scroll */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: { xs: 'column', md: 'row' },
          ...(isDragging && { pointerEvents: 'none' }),
        }}
      >
        {/* LEFT — isolated scroll container for the form only */}
        <Box
          sx={{
            flex: 1,
            minWidth: { md: MIN_FORM_WIDTH },
            minHeight: 0,
            height: '100%',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <InteractionFormPanel />
        </Box>

        {/* Mobile form — top half */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            width: '100%',
            height: '55%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <InteractionFormPanel />
        </Box>

        {/* Drag divider */}
        <Box
          onMouseDown={onDividerMouseDown}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexShrink: 0,
            width: 5,
            height: '100%',
            cursor: 'col-resize',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDragging ? 'primary.main' : 'transparent',
            transition: 'background-color 0.15s ease',
            zIndex: 2,
            '&:hover': {
              bgcolor: 'primary.main',
              '& .divider-handle': { opacity: 1 },
            },
          }}
        >
          <Box
            className="divider-handle"
            sx={{
              opacity: isDragging ? 1 : 0,
              transition: 'opacity 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.7 }}
              />
            ))}
          </Box>
        </Box>

        {/* RIGHT — fixed column; AI card stays in place, chat scrolls inside */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'flex' },
            flexDirection: 'column',
            flex: { xs: '0 0 45%', md: 'none' },
            width: { xs: '100%', md: `${aiPanelWidth}px` },
            minWidth: { md: MIN_AI_WIDTH },
            height: '100%',
            minHeight: 0,
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: 'background.default',
            borderTop: { xs: '2px solid', md: 'none' },
            borderColor: { xs: 'divider', md: 'transparent' },
            p: { md: 1.25 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: { md: 3 },
              border: { md: '1px solid' },
              borderColor: { md: 'divider' },
              boxShadow: { md: '0 4px 24px rgba(0,0,0,0.07)' },
              bgcolor: 'background.paper',
            }}
          >
            <AIChatPanel />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LogInteractionPage;
