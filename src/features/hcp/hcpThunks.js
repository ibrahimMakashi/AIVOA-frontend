import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchHCPs = createAsyncThunk(
  'hcp/fetchAll',
  async ({ search = '', page = 1, pageSize = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/v1/hcps', {
        params: { search: search || undefined, page, page_size: pageSize },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load HCPs.');
    }
  }
);

export const fetchHCPById = createAsyncThunk(
  'hcp/fetchById',
  async (hcpId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/hcps/${hcpId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'HCP not found.');
    }
  }
);

export const createHCP = createAsyncThunk(
  'hcp/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/v1/hcps', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create HCP.');
    }
  }
);

export const updateHCP = createAsyncThunk(
  'hcp/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/v1/hcps/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update HCP.');
    }
  }
);

export const deleteHCP = createAsyncThunk(
  'hcp/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/hcps/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete HCP.');
    }
  }
);

export const searchHCPsInline = async (query) => {
  const { data } = await api.get('/api/v1/hcps', {
    params: { search: query, page: 1, page_size: 10 },
  });
  return data.items;
};
