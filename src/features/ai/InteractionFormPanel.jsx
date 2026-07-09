import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, TextField, MenuItem, Button, Typography, Chip, CircularProgress,
  Autocomplete, Alert, Divider, alpha, LinearProgress,
  Tooltip,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  selectFormData, selectFieldStatus, selectAiGeneratedFields,
  selectCompletedInteractionId, selectIsStreaming, updateFormField,
  resetForm, fieldManuallyEdited,
} from './aiSlice';
import { createInteraction } from '../interactions/interactionThunks';
import { selectInteractionSubmitting } from '../interactions/interactionSlice';
import StreamingField from '../../components/common/StreamingField';
import useNotification from '../../hooks/useNotification';
import { INTERACTION_TYPES, SENTIMENT_OPTIONS } from '../../utils/constants';
import { searchHCPsInline } from '../hcp/hcpThunks';
import { today } from '../../utils/dateHelpers';

// Fields that support character-by-character typing animation
const ANIMATED_TEXT_FIELDS = [
  'doctor_name', 'hospital', 'specialty',
  'summary', 'followup_action', 'notes',
];

// Characters per second for the typing effect (~50 cps feels natural)
const TYPING_SPEED_MS = 18;

const SectionTitle = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      fontWeight: 700,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      fontSize: '0.7rem',
      display: 'block',
      mb: 1.5,
      mt: 0.5,
    }}
  >
    {children}
  </Typography>
);

const SectionCard = ({ children }) => (
  <Box
    sx={{
      p: 2,
      mb: 2,
      borderRadius: 3,
      border: '1px solid',
      borderColor: (t) => alpha(t.palette.divider, 0.8),
      bgcolor: 'background.paper',
      boxShadow: '0 6px 24px rgba(15, 23, 42, 0.04)',
    }}
  >
    {children}
  </Box>
);

const InteractionFormPanel = () => {
  const dispatch = useDispatch();
  const notify = useNotification();
  const formData = useSelector(selectFormData);
  const fieldStatus = useSelector(selectFieldStatus);
  const aiGeneratedFields = useSelector(selectAiGeneratedFields);
  const completedInteractionId = useSelector(selectCompletedInteractionId);
  const isStreaming = useSelector(selectIsStreaming);
  const isSubmitting = useSelector(selectInteractionSubmitting);

  const [hcpOptions, setHcpOptions] = useState([]);
  const [hcpSearching, setHcpSearching] = useState(false);
  const [productInput, setProductInput] = useState('');
  const [hcpInputValue, setHcpInputValue] = useState('');

  // ── Typing animation state ────────────────────────────────────────────────
  // localDisplay tracks the animated display values for text fields.
  // Redux (formData) always holds the true/final value.
  const [localDisplay, setLocalDisplay] = useState(() =>
    ANIMATED_TEXT_FIELDS.reduce((acc, f) => ({ ...acc, [f]: formData[f] || '' }), {})
  );
  const prevFormDataRef = useRef({ ...formData });
  const animTimersRef = useRef({});
  const formBodyRef = useRef(null);
  const fieldRefs = useRef({});
  const prevFieldStatusRef = useRef(fieldStatus);

  // Start/cancel typing animations whenever formData or aiGeneratedFields change
  useEffect(() => {
    ANIMATED_TEXT_FIELDS.forEach((field) => {
      const targetVal = formData[field] || '';
      const prevVal = prevFormDataRef.current[field] ?? '';

      if (targetVal === prevVal) return; // nothing changed for this field
      prevFormDataRef.current[field] = targetVal;

      // Cancel existing animation for this field
      if (animTimersRef.current[field]) {
        clearTimeout(animTimersRef.current[field]);
        animTimersRef.current[field] = null;
      }

      if (aiGeneratedFields[field] && targetVal) {
        // ── Animate character by character ────────────────────────────────
        let i = 0;
        setLocalDisplay((prev) => ({ ...prev, [field]: '' }));

        // Also sync hcpInputValue if doctor_name is being animated
        if (field === 'doctor_name') setHcpInputValue('');

        const tick = () => {
          i++;
          const slice = targetVal.slice(0, i);
          setLocalDisplay((prev) => ({ ...prev, [field]: slice }));
          if (field === 'doctor_name') setHcpInputValue(slice);

          if (i < targetVal.length) {
            animTimersRef.current[field] = setTimeout(tick, TYPING_SPEED_MS);
          }
        };
        animTimersRef.current[field] = setTimeout(tick, TYPING_SPEED_MS);
      } else {
        // Not AI generated — update immediately (user edit or reset)
        setLocalDisplay((prev) => ({ ...prev, [field]: targetVal }));
        if (field === 'doctor_name') setHcpInputValue(targetVal);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, aiGeneratedFields]);

  // Cleanup animation timers on unmount
  useEffect(() => {
    const timers = animTimersRef.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const previous = prevFieldStatusRef.current;
    const nextField = Object.keys(fieldStatus).find(
      (field) => fieldStatus[field] === 'filling' && previous[field] !== 'filling'
    );

    if (nextField && fieldRefs.current[nextField]) {
      fieldRefs.current[nextField].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    prevFieldStatusRef.current = fieldStatus;
  }, [fieldStatus]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleHcpSearch = useCallback(async (query) => {
    if (!query || query.length < 2) return;
    setHcpSearching(true);
    try {
      const results = await searchHCPsInline(query);
      setHcpOptions(results);
    } catch {
      setHcpOptions([]);
    } finally {
      setHcpSearching(false);
    }
  }, []);

  /**
   * Update a field in both Redux and local display.
   * Syncing prevFormDataRef prevents the animation effect from re-triggering
   * on the next render caused by this user edit.
   */
  const updateField = useCallback((field, value) => {
    // Stop any in-flight animation for this field
    if (animTimersRef.current[field]) {
      clearTimeout(animTimersRef.current[field]);
      animTimersRef.current[field] = null;
    }
    // Sync ref so the animation effect won't re-trigger
    prevFormDataRef.current[field] = value;

    if (ANIMATED_TEXT_FIELDS.includes(field)) {
      setLocalDisplay((prev) => ({ ...prev, [field]: value }));
    }
    dispatch(updateFormField({ field, value }));
    dispatch(fieldManuallyEdited(field));
  }, [dispatch]);

  const addProduct = () => {
    const product = productInput.trim();
    if (!product) return;
    const current = formData.products_discussed || [];
    if (!current.includes(product)) {
      dispatch(updateFormField({ field: 'products_discussed', value: [...current, product] }));
      dispatch(fieldManuallyEdited('products_discussed'));
    }
    setProductInput('');
  };

  const removeProduct = (product) => {
    dispatch(updateFormField({
      field: 'products_discussed',
      value: (formData.products_discussed || []).filter((p) => p !== product),
    }));
    dispatch(fieldManuallyEdited('products_discussed'));
  };

  const handleSave = async () => {
    if (!formData.hcp_id && !formData.doctor_name) {
      notify.error('Please select or enter a doctor name.');
      return;
    }
    if (!formData.interaction_date) {
      notify.error('Please enter the interaction date.');
      return;
    }
    if (completedInteractionId) {
      notify.info('This interaction was already saved by AI.');
      return;
    }

    const payload = {
      hcp_id: formData.hcp_id,
      interaction_date: formData.interaction_date,
      location: formData.hospital || undefined,
      interaction_type: formData.interaction_type || 'visit',
      products_discussed: formData.products_discussed?.length ? formData.products_discussed : undefined,
      summary: formData.summary || undefined,
      sentiment: formData.sentiment || 'neutral',
      notes: formData.notes
        ? [{ content: formData.notes, note_type: 'general' }]
        : undefined,
    };

    const result = await dispatch(createInteraction(payload));
    if (!result.error) {
      notify.success('Interaction saved successfully!');
    } else {
      notify.error(result.payload || 'Failed to save interaction.');
    }
  };

  const aiFilledCount = Object.values(aiGeneratedFields).filter(Boolean).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Interaction Form
          </Typography>
          {aiFilledCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: '0.8rem', color: 'secondary.main' }} />
              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                {aiFilledCount} field{aiFilledCount !== 1 ? 's' : ''} filled by AI
              </Typography>
            </Box>
          )}
        </Box>
        <Tooltip title="Reset form">
          <Button
            size="small"
            startIcon={<RestartAltRoundedIcon />}
            onClick={() => dispatch(resetForm())}
            sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
          >
            Reset
          </Button>
        </Tooltip>
      </Box>

      {/* Streaming progress bar */}
      {isStreaming && (
        <LinearProgress
          sx={{
            height: 3,
            bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
            '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' },
          }}
        />
      )}

      {/* AI-saved success banner */}
      {completedInteractionId && (
        <Alert
          severity="success"
          icon={<CheckCircleRoundedIcon />}
          sx={{ m: 1.5, borderRadius: 2, py: 0.75, flexShrink: 0 }}
          action={
            <Button size="small" color="success" onClick={() => dispatch(resetForm())}>
              New
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Interaction saved by AI</Typography>
          <Typography variant="caption">ID: {completedInteractionId}</Typography>
        </Alert>
      )}

      {/* Form body — only this area scrolls */}
      <Box ref={formBodyRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }}>

        <SectionCard>
          <SectionTitle>HCP Details</SectionTitle>

          <Box ref={(el) => { fieldRefs.current.doctor_name = el; }}>
            <StreamingField status={fieldStatus.doctor_name} aiGenerated={aiGeneratedFields.doctor_name} label="Doctor Name">
              <Autocomplete
                freeSolo
                options={hcpOptions}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.full_name)}
                inputValue={hcpInputValue}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') {
                    setHcpInputValue(value);
                    updateField('doctor_name', value);
                    handleHcpSearch(value);
                  }
                }}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue === 'object') {
                    dispatch(updateFormField({ field: 'hcp_id', value: newValue.id }));
                    dispatch(updateFormField({ field: 'doctor_name', value: newValue.full_name }));
                    dispatch(updateFormField({ field: 'hospital', value: newValue.hospital || '' }));
                    dispatch(updateFormField({ field: 'specialty', value: newValue.specialty || '' }));
                    setHcpInputValue(newValue.full_name);
                    prevFormDataRef.current.doctor_name = newValue.full_name;
                    prevFormDataRef.current.hospital = newValue.hospital || '';
                    prevFormDataRef.current.specialty = newValue.specialty || '';
                    setLocalDisplay((prev) => ({
                      ...prev,
                      doctor_name: newValue.full_name,
                      hospital: newValue.hospital || prev.hospital,
                      specialty: newValue.specialty || prev.specialty,
                    }));
                  }
                }}
                renderOption={(props, opt) => (
                  <li {...props} key={opt.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{opt.specialty} · {opt.hospital}</Typography>
                    </Box>
                  </li>
                )}
                loading={hcpSearching}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Doctor Name"
                    placeholder="Dr. Sharma or search existing HCPs"
                    size="small"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {hcpSearching && <CircularProgress size={14} sx={{ mr: 1 }} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </StreamingField>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.hospital = el; }}>
              <StreamingField status={fieldStatus.hospital} aiGenerated={aiGeneratedFields.hospital} label="Hospital">
                <TextField
                  label="Hospital / Clinic"
                  value={localDisplay.hospital}
                  onChange={(e) => updateField('hospital', e.target.value)}
                  fullWidth
                  size="small"
                />
              </StreamingField>
            </Box>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.specialty = el; }}>
              <StreamingField status={fieldStatus.specialty} aiGenerated={aiGeneratedFields.specialty} label="Specialty">
                <TextField
                  label="Specialty"
                  value={localDisplay.specialty}
                  onChange={(e) => updateField('specialty', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Endocrinologist"
                />
              </StreamingField>
            </Box>
          </Box>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Meeting Details</SectionTitle>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.interaction_date = el; }}>
              <StreamingField status={fieldStatus.interaction_date} aiGenerated={aiGeneratedFields.interaction_date} label="Meeting Date">
                <TextField
                  label="Meeting Date"
                  type="date"
                  value={formData.interaction_date}
                  onChange={(e) => {
                    dispatch(updateFormField({ field: 'interaction_date', value: e.target.value }));
                    dispatch(fieldManuallyEdited('interaction_date'));
                  }}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: today() }}
                />
              </StreamingField>
            </Box>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.interaction_type = el; }}>
              <StreamingField status={fieldStatus.interaction_type} aiGenerated={aiGeneratedFields.interaction_type} label="Type">
                <TextField
                  select
                  label="Meeting Type"
                  value={formData.interaction_type}
                  onChange={(e) => {
                    dispatch(updateFormField({ field: 'interaction_type', value: e.target.value }));
                    dispatch(fieldManuallyEdited('interaction_type'));
                  }}
                  fullWidth
                  size="small"
                >
                  {INTERACTION_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </TextField>
              </StreamingField>
            </Box>
          </Box>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Discussion</SectionTitle>

          <Box ref={(el) => { fieldRefs.current.products_discussed = el; }}>
            <StreamingField status={fieldStatus.products_discussed} aiGenerated={aiGeneratedFields.products_discussed} label="Products Discussed">
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Add Product"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProduct(); } }}
                    size="small"
                    fullWidth
                    placeholder="e.g. Diabetrol, CardioMax"
                  />
                  <Button variant="outlined" size="small" onClick={addProduct} sx={{ minWidth: 36, px: 1 }}>
                    <AddRoundedIcon fontSize="small" />
                  </Button>
                </Box>
                {(formData.products_discussed || []).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {formData.products_discussed.map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        onDelete={() => removeProduct(p)}
                        size="small"
                        deleteIcon={<CloseRoundedIcon />}
                        sx={{ fontWeight: 500, bgcolor: (t) => alpha(t.palette.primary.main, 0.08), color: 'primary.main' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </StreamingField>
          </Box>

          <Box sx={{ mt: 1.5 }} ref={(el) => { fieldRefs.current.summary = el; }}>
            <StreamingField status={fieldStatus.summary} aiGenerated={aiGeneratedFields.summary} label="Discussion Summary">
              <TextField
                label="Discussion Summary"
                value={localDisplay.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                size="small"
                placeholder="What was discussed?"
              />
            </StreamingField>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.sentiment = el; }}>
              <StreamingField status={fieldStatus.sentiment} aiGenerated={aiGeneratedFields.sentiment} label="Sentiment">
                <TextField
                  select
                  label="Doctor's Sentiment"
                  value={formData.sentiment}
                  onChange={(e) => {
                    dispatch(updateFormField({ field: 'sentiment', value: e.target.value }));
                    dispatch(fieldManuallyEdited('sentiment'));
                  }}
                  fullWidth
                  size="small"
                >
                  {SENTIMENT_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </StreamingField>
            </Box>
          </Box>

        </SectionCard>

        <SectionCard>
          <SectionTitle>Follow-up</SectionTitle>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.followup_date = el; }}>
              <StreamingField status={fieldStatus.followup_date} aiGenerated={aiGeneratedFields.followup_date} label="Follow-up Date">
                <TextField
                  label="Follow-up Date"
                  type="date"
                  value={formData.followup_date}
                  onChange={(e) => {
                    dispatch(updateFormField({ field: 'followup_date', value: e.target.value }));
                    dispatch(fieldManuallyEdited('followup_date'));
                  }}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </StreamingField>
            </Box>
            <Box sx={{ flex: 1 }} ref={(el) => { fieldRefs.current.followup_action = el; }}>
              <StreamingField status={fieldStatus.followup_action} aiGenerated={aiGeneratedFields.followup_action} label="Follow-up Action">
                <TextField
                  label="Follow-up Action"
                  value={localDisplay.followup_action}
                  onChange={(e) => updateField('followup_action', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Send clinical data"
                />
              </StreamingField>
            </Box>
          </Box>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Additional Notes</SectionTitle>

          <Box ref={(el) => { fieldRefs.current.notes = el; }}>
            <StreamingField status={fieldStatus.notes} aiGenerated={aiGeneratedFields.notes} label="Additional Notes">
              <TextField
                label="Notes"
                value={localDisplay.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                fullWidth
                multiline
                minRows={2}
                size="small"
                placeholder="Any additional notes..."
              />
            </StreamingField>
          </Box>
        </SectionCard>

        <Box sx={{ height: 8 }} />
      </Box>

      {/* ── Save button ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSave}
          disabled={isSubmitting || isStreaming || !!completedInteractionId}
          startIcon={
            isSubmitting
              ? <CircularProgress size={18} color="inherit" />
              : completedInteractionId
              ? <CheckCircleRoundedIcon />
              : <SaveRoundedIcon />
          }
          sx={{
            fontWeight: 700,
            py: 1.25,
            ...(completedInteractionId && {
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
              '&.Mui-disabled': { bgcolor: '#E8F5E9', color: '#2E7D32' },
            }),
          }}
        >
          {completedInteractionId ? 'Saved by AI ✓' : isSubmitting ? 'Saving...' : 'Save Interaction'}
        </Button>
        {!completedInteractionId && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.75 }}>
            AI-filled fields animate in and are highlighted in green
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default InteractionFormPanel;
