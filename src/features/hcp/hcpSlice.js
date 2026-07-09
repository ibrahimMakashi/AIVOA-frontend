import { createSlice } from '@reduxjs/toolkit';
import { fetchHCPs, fetchHCPById, createHCP, updateHCP, deleteHCP } from './hcpThunks';

const hcpSlice = createSlice({
  name: 'hcp',
  initialState: {
    hcps: [],
    currentHcp: null,
    total: 0,
    page: 1,
    pageSize: 20,
    searchQuery: '',
    isLoading: false,
    isLoadingDetail: false,
    error: null,
  },
  reducers: {
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; state.page = 1; },
    setPage: (state, action) => { state.page = action.payload; },
    clearCurrentHcp: (state) => { state.currentHcp = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hcps = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchHCPById.pending, (state) => { state.isLoadingDetail = true; })
      .addCase(fetchHCPById.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.currentHcp = action.payload;
      })
      .addCase(fetchHCPById.rejected, (state) => { state.isLoadingDetail = false; });

    builder.addCase(createHCP.fulfilled, (state, action) => {
      state.hcps.unshift(action.payload);
      state.total += 1;
    });

    builder.addCase(updateHCP.fulfilled, (state, action) => {
      const idx = state.hcps.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) state.hcps[idx] = action.payload;
      if (state.currentHcp?.id === action.payload.id) state.currentHcp = action.payload;
    });

    builder.addCase(deleteHCP.fulfilled, (state, action) => {
      state.hcps = state.hcps.filter((h) => h.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    });
  },
});

export const { setSearchQuery, setPage, clearCurrentHcp, clearError } = hcpSlice.actions;

export const selectHCPs = (s) => s.hcp.hcps;
export const selectHCPTotal = (s) => s.hcp.total;
export const selectCurrentHcp = (s) => s.hcp.currentHcp;
export const selectHCPLoading = (s) => s.hcp.isLoading;
export const selectHCPDetailLoading = (s) => s.hcp.isLoadingDetail;
export const selectHCPSearchQuery = (s) => s.hcp.searchQuery;
export const selectHCPPage = (s) => s.hcp.page;
export const selectHCPPageSize = (s) => s.hcp.pageSize;

export default hcpSlice.reducer;
