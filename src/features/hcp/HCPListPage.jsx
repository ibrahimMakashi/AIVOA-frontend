import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TextField, InputAdornment, Button, Chip,
  Avatar, Skeleton, Typography, IconButton, Tooltip, alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { fetchHCPs } from './hcpThunks';
import {
  selectHCPs, selectHCPTotal, selectHCPLoading,
  selectHCPSearchQuery, selectHCPPage, selectHCPPageSize,
  setSearchQuery, setPage,
} from './hcpSlice';
import PageHeader from '../../components/common/PageHeader';

const TIER_COLORS = { A: '#1565C0', B: '#00695C', C: '#546E7A' };
const TIER_BG = { A: '#EBF3FB', B: '#E0F2F1', C: '#ECEFF1' };

const HCPListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hcps = useSelector(selectHCPs);
  const total = useSelector(selectHCPTotal);
  const isLoading = useSelector(selectHCPLoading);
  const searchQuery = useSelector(selectHCPSearchQuery);
  const page = useSelector(selectHCPPage);
  const pageSize = useSelector(selectHCPPageSize);
  const [inputValue, setInputValue] = React.useState(searchQuery);
  const searchTimer = React.useRef(null);

  const load = useCallback(() => {
    dispatch(fetchHCPs({ search: searchQuery, page, pageSize }));
  }, [dispatch, searchQuery, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => dispatch(setSearchQuery(val)), 400);
  };

  const SkeletonRows = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Skeleton variant="circular" width={36} height={36} /><Box><Skeleton width={120} /><Skeleton width={80} /></Box></Box></TableCell>
        <TableCell><Skeleton width={100} /></TableCell>
        <TableCell><Skeleton width={140} /></TableCell>
        <TableCell><Skeleton width={60} /></TableCell>
        <TableCell><Skeleton width={80} /></TableCell>
        <TableCell><Skeleton width={40} /></TableCell>
      </TableRow>
    ));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto', width: '100%', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title="HCP Directory"
        subtitle="Manage and search your Healthcare Professional network"
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/log-interaction')}>
            Log Interaction
          </Button>
        }
      />

      {/* Search bar */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          placeholder="Search by name, hospital, specialty, or city..."
          value={inputValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 480 }}
        />
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>City</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : hcps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <PersonRoundedIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
                    <Typography color="text.secondary">
                      {searchQuery ? `No HCPs found for "${searchQuery}"` : 'No HCPs in the directory yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                hcps.map((hcp) => (
                  <TableRow
                    key={hcp.id}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.03) } }}
                    onClick={() => navigate(`/hcps/${hcp.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {hcp.full_name?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {hcp.full_name}
                          </Typography>
                          {hcp.email && (
                            <Typography variant="caption" color="text.secondary">{hcp.email}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{hcp.specialty || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{hcp.hospital || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      {hcp.tier ? (
                        <Chip
                          label={`Tier ${hcp.tier}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: TIER_BG[hcp.tier],
                            color: TIER_COLORS[hcp.tier],
                            fontSize: '0.75rem',
                          }}
                        />
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{hcp.city || '—'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/hcps/${hcp.id}`); }}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                        >
                          <ArrowForwardRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Log Interaction">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate('/log-interaction'); }}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'secondary.main' } }}
                        >
                          <EventNoteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
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

export default HCPListPage;
