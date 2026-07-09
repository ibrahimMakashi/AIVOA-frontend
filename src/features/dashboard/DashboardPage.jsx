import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Skeleton, Divider, alpha, IconButton, Tooltip,
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import SentimentChip from '../../components/common/SentimentChip';
import { fetchInteractions } from '../interactions/interactionThunks';
import { fetchHCPs } from '../hcp/hcpThunks';
import {
  selectInteractions, selectInteractionLoading,
} from '../interactions/interactionSlice';
import { selectHCPs } from '../hcp/hcpSlice';
import { selectCurrentUser } from '../auth/authSlice';
import { formatDate, isDueToday, isOverdue } from '../../utils/dateHelpers';
import api from '../../services/api';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const interactions = useSelector(selectInteractions);
  const hcps = useSelector(selectHCPs);
  const isLoading = useSelector(selectInteractionLoading);
  const [followups, setFollowups] = useState([]);
  const [followupsLoading, setFollowupsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchInteractions({ page: 1, pageSize: 5 }));
    dispatch(fetchHCPs({ page: 1, pageSize: 1 }));
    api.get('/api/v1/followups', { params: { status: 'pending', page_size: 5 } })
      .then(({ data }) => setFollowups(data.items || []))
      .finally(() => setFollowupsLoading(false));
  }, [dispatch]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto', width: '100%', overflowY: 'auto', height: '100%' }}>
      {/* Welcome header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Here's your CRM overview for today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
      </Box>

      {/* Quick action banner */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #0288D1 100%)',
          border: 'none',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 60,
            bottom: -40,
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.04)',
          }}
        />
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AutoAwesomeRoundedIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }} />
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em' }}>
                AI Assistant
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
              Log an interaction with your voice or text
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Just describe your meeting — AI will extract and populate the entire form.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/log-interaction')}
            startIcon={<AddCircleRoundedIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.dark',
              fontWeight: 700,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
              whiteSpace: 'nowrap',
            }}
          >
            Log Interaction
          </Button>
        </CardContent>
      </Card>

      {/* Stats row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Total HCPs', value: isLoading ? '—' : hcps.length || 0, icon: <PeopleRoundedIcon />, color: 'primary', trend: 12, trendLabel: 'vs last month' },
          { title: 'Interactions This Month', value: isLoading ? '—' : interactions.length || 0, icon: <EventNoteRoundedIcon />, color: 'info', trend: 8, trendLabel: 'vs last month' },
          { title: 'Pending Follow-ups', value: followupsLoading ? '—' : followups.length, icon: <CalendarTodayRoundedIcon />, color: 'warning' },
          { title: 'AI-Logged Today', value: interactions.filter((i) => i.ai_generated).length, icon: <AutoAwesomeRoundedIcon />, color: 'ai', trendLabel: 'of total today' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <StatCard {...stat} loading={isLoading && stat.title === 'Interactions This Month'} />
          </Grid>
        ))}
      </Grid>

      {/* Two-column content */}
      <Grid container spacing={2.5}>
        {/* Recent interactions */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Recent Interactions
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => navigate('/interactions')}
                  sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  View All
                </Button>
              </Box>
              <Divider />

              {isLoading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : interactions.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <EventNoteRoundedIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">No interactions logged yet.</Typography>
                  <Button size="small" sx={{ mt: 1 }} onClick={() => navigate('/log-interaction')}>
                    Log your first interaction
                  </Button>
                </Box>
              ) : (
                <List disablePadding>
                  {interactions.slice(0, 5).map((interaction, i) => (
                    <React.Fragment key={interaction.id}>
                      <ListItem
                        sx={{ px: 2.5, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate('/interactions')}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}>
                            {interaction.hcp?.full_name?.[0] || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {interaction.hcp?.full_name || 'Unknown HCP'}
                              </Typography>
                              {interaction.ai_generated && (
                                <Chip label="AI" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#E0F7F4', color: '#00897B', fontWeight: 700 }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(interaction.interaction_date)} · {interaction.hcp?.hospital}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ ml: 1 }}>
                          <SentimentChip value={interaction.sentiment} />
                        </Box>
                      </ListItem>
                      {i < interactions.slice(0, 5).length - 1 && <Divider component="li" sx={{ ml: 9 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming follow-ups */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Pending Follow-ups
                </Typography>
                <Chip
                  label={followups.length}
                  size="small"
                  sx={{ bgcolor: (t) => alpha(t.palette.warning.main, 0.1), color: 'warning.main', fontWeight: 700 }}
                />
              </Box>
              <Divider />

              {followupsLoading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1.5, borderRadius: 2 }} />)}
                </Box>
              ) : followups.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 48, color: '#C8E6C9', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">All caught up! No pending follow-ups.</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {followups.map((fu, i) => {
                    const overdue = isOverdue(fu.due_date);
                    const today = isDueToday(fu.due_date);
                    return (
                      <React.Fragment key={fu.id}>
                        <ListItem sx={{ px: 2.5, py: 1.5 }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: overdue ? 'error.main' : today ? 'warning.main' : 'success.main',
                              mr: 1.5,
                              flexShrink: 0,
                            }}
                          />
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                {fu.action_type || 'Follow-up'}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                                <Typography variant="caption" sx={{ color: overdue ? 'error.main' : 'text.secondary', fontWeight: overdue ? 600 : 400 }}>
                                  {overdue ? 'OVERDUE · ' : today ? 'TODAY · ' : ''}
                                  {formatDate(fu.due_date)}
                                </Typography>
                                {fu.hcp && (
                                  <Typography variant="caption" color="text.secondary">
                                    · {fu.hcp.full_name}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {i < followups.length - 1 && <Divider component="li" sx={{ ml: 5 }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
