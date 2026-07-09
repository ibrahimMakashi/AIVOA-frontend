import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, TextField, IconButton, Typography, Avatar, Paper,
  CircularProgress, Tooltip, alpha,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from './aiSlice';
import {
  selectAiMessages, selectIsThinking, selectIsStreaming, selectSessionId,
} from './aiSlice';
import useSSE from '../../hooks/useSSE';

const TypingIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75 }}>
    {[0, 0.2, 0.4].map((delay, i) => (
      <Box
        key={i}
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: 'text.secondary',
          animation: `typing 1.2s ${delay}s ease-in-out infinite`,
          '@keyframes typing': {
            '0%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
            '50%': { transform: 'translateY(-5px)', opacity: 1 },
          },
        }}
      />
    ))}
  </Box>
);

const SUGGESTION_PROMPTS = [
  'I met Dr Sharma yesterday at Apollo Hospital. We discussed Diabetrol. He requested clinical data. Follow up next Monday.',
  'Visited Dr Priya Mehta at Fortis, Mumbai today. She was positive about CardioMax. Schedule follow-up in 2 weeks.',
  'Called Dr Ramesh Gupta this morning. Discussed upcoming conference. He is interested in Diabetrol samples.',
];

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-end',
        flexDirection: isUser ? 'row-reverse' : 'row',
        mb: 1.5,
      }}
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          bgcolor: isUser ? 'primary.main' : (t) => alpha(t.palette.secondary.main, 0.12),
          color: isUser ? 'white' : 'secondary.main',
        }}
      >
        {isUser
          ? <PersonRoundedIcon sx={{ fontSize: '1rem' }} />
          : <AutoAwesomeRoundedIcon sx={{ fontSize: '1rem' }} />
        }
      </Avatar>

      <Box
        sx={{
          maxWidth: '78%',
          px: 1.75,
          py: 1.25,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          bgcolor: isUser ? 'primary.main' : (t) => alpha(t.palette.background.paper, 0.96),
          color: isUser ? 'white' : 'text.primary',
          border: isUser ? 'none' : '1px solid',
          borderColor: isUser ? 'transparent' : 'divider',
          boxShadow: isUser ? '0 2px 8px rgba(21,101,192,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
          animation: 'fadeSlideIn 0.25s ease',
          '@keyframes fadeSlideIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {isUser ? (
          <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.55, fontWeight: 400 }}>
            {message.content}
          </Typography>
        ) : (
          <Box
            sx={{
              '& p': { m: 0, fontSize: '0.875rem', lineHeight: 1.6 },
              '& p + p': { mt: 0.75 },
              '& code': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08), px: 0.5, py: 0.125, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85em' },
              '& ul, & ol': { pl: 2, m: 0 },
              '& li': { fontSize: '0.875rem', lineHeight: 1.6 },
              '& h3': { m: 0, fontSize: '0.95rem', fontWeight: 700 },
              '& h4': { m: '0.5rem 0 0', fontSize: '0.875rem', fontWeight: 600 },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 2,
                  height: '1em',
                  ml: 0.25,
                  verticalAlign: 'text-bottom',
                  bgcolor: 'secondary.main',
                  animation: 'blink 0.9s step-end infinite',
                  '@keyframes blink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 },
                  },
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const AIChatPanel = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectAiMessages);
  const isThinking = useSelector(selectIsThinking);
  const isStreaming = useSelector(selectIsStreaming);
  const sessionId = useSelector(selectSessionId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isChatStreaming = messages.some((m) => m.isStreaming);

  // SSE hook — watches sessionId and opens EventSource automatically
  useSSE(sessionId);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isChatStreaming]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isThinking || isStreaming) return;
    setInput('');
    dispatch(sendChatMessage({ message: text }));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.75,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: '1rem' }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            AI Assistant
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {isChatStreaming
              ? '● Writing...'
              : isStreaming
                ? '● Extracting fields...'
                : isThinking
                  ? '● Thinking...'
                  : '● Ready'}
          </Typography>
        </Box>
        {isStreaming && (
          <Box sx={{ ml: 'auto' }}>
            <CircularProgress size={16} sx={{ color: 'secondary.main' }} />
          </Box>
        )}
      </Box>

      {/* Messages area — flex: 1 + minHeight: 0 makes overflowY: auto actually clip */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 1.75,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, pb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #E0F7F4 0%, #B2EBE6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ color: 'secondary.main', fontSize: '1.75rem' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Describe your interaction
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
                Type naturally — AI will extract the doctor, hospital, date, products, and follow-ups automatically.
              </Typography>
            </Box>

            {/* Suggestion prompts */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', maxWidth: 320 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textAlign: 'center', mb: 0.25 }}>
                Try these examples
              </Typography>
              {SUGGESTION_PROMPTS.map((prompt) => (
                <Paper
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                    },
                  }}
                >
                  <Typography variant="caption" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                    "{prompt.substring(0, 80)}..."
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isThinking && !isChatStreaming && (
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-end', mb: 1.5 }}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: (t) => alpha(t.palette.secondary.main, 0.12), color: 'secondary.main' }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: '1rem' }} />
            </Avatar>
            <Box sx={{ px: 1.75, py: 1, borderRadius: '18px 18px 18px 4px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <TypingIndicator />
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid',
          borderColor: (t) => alpha(t.palette.divider, 0.9),
          bgcolor: (t) => alpha(t.palette.background.paper, 0.96),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            p: 0.75,
            borderRadius: 99,
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.divider, 0.85),
            bgcolor: (t) => alpha(t.palette.common.white, 0.9),
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Describe your HCP interaction..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking || isStreaming}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 99,
                fontSize: '0.875rem',
                lineHeight: 1.5,
                bgcolor: 'transparent',
                px: 0.5,
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
              '& .MuiInputBase-input': {
                py: 0.65,
              },
            }}
          />
          <Tooltip title="Send (Enter)">
            <Box sx={{ flexShrink: 0 }}>
              <IconButton
                onClick={handleSend}
                disabled={!input.trim() || isThinking || isStreaming}
                sx={{
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  color: 'white',
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  boxShadow: '0 10px 18px rgba(21, 101, 192, 0.28)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 12px 22px rgba(21, 101, 192, 0.32)',
                  },
                  '&.Mui-disabled': {
                    color: 'white',
                    opacity: 0.72,
                    background: 'linear-gradient(135deg, #90A4AE 0%, #78909C 100%)',
                    boxShadow: 'none',
                  },
                }}
              >
                {isThinking || isStreaming
                  ? <CircularProgress size={16} sx={{ color: 'white' }} />
                  : <SendRoundedIcon sx={{ fontSize: '1rem' }} />
                }
              </IconButton>
            </Box>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          Press Enter to send · Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
};

export default AIChatPanel;
