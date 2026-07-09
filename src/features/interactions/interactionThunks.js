import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async ({ hcpId, page = 1, pageSize = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/v1/interactions', {
        params: { hcp_id: hcpId || undefined, page, page_size: pageSize },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load interactions.');
    }
  }
);

export const fetchInteractionById = createAsyncThunk(
  'interactions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/interactions/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Interaction not found.');
    }
  }
);

export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/v1/interactions', payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to save interaction.'
      );
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interactions/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/v1/interactions/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update interaction.'
      );
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/interactions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete.');
    }
  }
);
