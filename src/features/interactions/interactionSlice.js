import { createSlice } from '@reduxjs/toolkit';
import {
  fetchInteractions,
  fetchInteractionById,
  createInteraction,
  updateInteraction,
  deleteInteraction,
} from './interactionThunks';

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    interactions: [],
    currentInteraction: null,
    total: 0,
    page: 1,
    pageSize: 20,
    filterHcpId: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
  },
  reducers: {
    setPage: (state, action) => { state.page = action.payload; },
    setFilterHcpId: (state, action) => { state.filterHcpId = action.payload; state.page = 1; },
    clearCurrentInteraction: (state) => { state.currentInteraction = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interactions = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchInteractionById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchInteractionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInteraction = action.payload;
      })
      .addCase(fetchInteractionById.rejected, (state) => { state.isLoading = false; });

    builder
      .addCase(createInteraction.pending, (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.interactions.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateInteraction.pending, (state) => { state.isSubmitting = true; })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.interactions.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.interactions[idx] = action.payload;
        if (state.currentInteraction?.id === action.payload.id)
          state.currentInteraction = action.payload;
      })
      .addCase(updateInteraction.rejected, (state) => { state.isSubmitting = false; });

    builder.addCase(deleteInteraction.fulfilled, (state, action) => {
      state.interactions = state.interactions.filter((i) => i.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    });
  },
});

export const { setPage, setFilterHcpId, clearCurrentInteraction, clearError } =
  interactionSlice.actions;

export const selectInteractions = (s) => s.interactions.interactions;
export const selectInteractionTotal = (s) => s.interactions.total;
export const selectCurrentInteraction = (s) => s.interactions.currentInteraction;
export const selectInteractionLoading = (s) => s.interactions.isLoading;
export const selectInteractionSubmitting = (s) => s.interactions.isSubmitting;
export const selectInteractionPage = (s) => s.interactions.page;
export const selectInteractionPageSize = (s) => s.interactions.pageSize;

export default interactionSlice.reducer;
