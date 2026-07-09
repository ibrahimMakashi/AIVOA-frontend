import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Button, Chip, Avatar, Skeleton,
  Typography, IconButton, Tooltip, alpha, Collapse,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { fetchInteractions } from './interactionThunks';
import {
  selectInteractions, selectInteractionTotal, selectInteractionLoading,
  selectInteractionPage, selectInteractionPageSize, setPage,
} from './interactionSlice';
import SentimentChip from '../../components/common/SentimentChip';
import PageHeader from '../../components/common/PageHeader';
import { formatDate } from '../../utils/dateHelpers';
import { INTERACTION_TYPES } from '../../utils/constants';

const TYPE_LABELS = Object.fromEntries(INTERACTION_TYPES.map((t) => [t.value, t.label]));

const InteractionRow = ({ interaction }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.02) },
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: (t) => alpha(t.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, fontSize: '0.85rem' }}>
              {interaction.hcp?.full_name?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {interaction.hcp?.full_name || 'Unknown HCP'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {interaction.hcp?.hospital}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{formatDate(interaction.interaction_date)}</Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={TYPE_LABELS[interaction.interaction_type] || interaction.interaction_type || 'Visit'}
            size="small"
            sx={{ fontSize: '0.75rem', fontWeight: 500, bgcolor: '#F0F4F8', color: 'text.secondary' }}
          />
        </TableCell>
        <TableCell sx={{ maxWidth: 240 }}>
          <Typography variant="body2" noWrap color="text.secondary">
            {interaction.summary || '—'}
          </Typography>
        </TableCell>
        <TableCell>
          {interaction.products_discussed?.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {interaction.products_discussed.slice(0, 2).map((p) => (
                <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
              ))}
              {interaction.products_discussed.length > 2 && (
                <Chip label={`+${interaction.products_discussed.length - 2}`} size="small" sx={{ fontSize: '0.72rem', height: 20 }} />
              )}
            </Box>
          ) : '—'}
        </TableCell>
        <TableCell><SentimentChip value={interaction.sentiment} /></TableCell>
        <TableCell>
          {interaction.ai_generated ? (
            <Chip icon={<AutoAwesomeRoundedIcon />} label="AI" size="small" sx={{ bgcolor: '#E0F7F4', color: '#00897B', fontWeight: 700, '& .MuiChip-icon': { color: '#00897B', fontSize: '0.8rem' } }} />
          ) : (
            <Chip label="Manual" size="small" sx={{ bgcolor: '#F5F5F5', color: 'text.secondary', fontWeight: 500 }} />
          )}
        </TableCell>
        <TableCell>
          <IconButton size="small">
            {expanded ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Expanded detail row */}
      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.02), borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {interaction.summary && (
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Summary</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{interaction.summary}</Typography>
                  </Box>
                )}
                {interaction.next_action && (
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next Action</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{interaction.next_action}</Typography>
                  </Box>
                )}
                {interaction.notes?.length > 0 && (
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</Typography>
                    {interaction.notes.map((note) => (
                      <Box key={note.id} sx={{ mt: 0.5 }}>
                        <Chip label={note.note_type} size="small" sx={{ mb: 0.5, height: 18, fontSize: '0.65rem' }} />
                        <Typography variant="body2">{note.content}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const InteractionHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const interactions = useSelector(selectInteractions);
  const total = useSelector(selectInteractionTotal);
  const isLoading = useSelector(selectInteractionLoading);
  const page = useSelector(selectInteractionPage);
  const pageSize = useSelector(selectInteractionPageSize);

  useEffect(() => {
    dispatch(fetchInteractions({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto', width: '100%', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title="Interaction History"
        subtitle={`${total} total interactions logged`}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Interactions' }]}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/log-interaction')}>
            Log Interaction
          </Button>
        }
      />

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Sentiment</TableCell>
                <TableCell>Source</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : interactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <EventNoteRoundedIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
                    <Typography color="text.secondary">No interactions logged yet.</Typography>
                    <Button size="small" sx={{ mt: 1 }} onClick={() => navigate('/log-interaction')}>
                      Log your first interaction
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                interactions.map((interaction) => (
                  <InteractionRow key={interaction.id} interaction={interaction} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(_, newPage) => dispatch(setPage(newPage + 1))}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[20]}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </Card>
    </Box>
  );
};

export default InteractionHistoryPage;
