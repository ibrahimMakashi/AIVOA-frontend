import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/**
 * aiSlice manages:
 * 1. Chat messages (conversation history)
 * 2. Streaming session (sessionId, queue consumption)
 * 3. Streaming fields (live form population)
 * 4. Interaction form data (populated by AI or manually)
 */

const INITIAL_FORM = {
  hcp_id: null,
  doctor_name: '',
  hospital: '',
  specialty: '',
  interaction_date: new Date().toISOString().split('T')[0],
  interaction_type: 'visit',
  products_discussed: [],
  summary: '',
  sentiment: 'neutral',
  followup_date: '',
  followup_action: '',
  followup_priority: 'medium',
  notes: '',
};

const INITIAL_FIELD_STATUS = {
  doctor_name: 'idle',
  hospital: 'idle',
  specialty: 'idle',
  interaction_date: 'idle',
  interaction_type: 'idle',
  products_discussed: 'idle',
  summary: 'idle',
  sentiment: 'idle',
  followup_date: 'idle',
  followup_action: 'idle',
  notes: 'idle',
};

/**
 * Sends the user's message to the backend AI chat endpoint.
 * Returns the session_id for SSE streaming.
 */
export const sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async ({ message, context }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const aiState = state.ai;

      const recentMessages = (aiState.messages || [])
        .slice(-8)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const derivedContext = {
        current_interaction_id: aiState.completedInteractionId || null,
        current_hcp: aiState.formData?.doctor_name
          ? {
              doctor_name: aiState.formData.doctor_name || null,
              hospital: aiState.formData.hospital || null,
              specialty: aiState.formData.specialty || null,
            }
          : null,
        current_form_state: {
          doctor_name: aiState.formData?.doctor_name || null,
          hospital: aiState.formData?.hospital || null,
          specialty: aiState.formData?.specialty || null,
          interaction_date: aiState.formData?.interaction_date || null,
          interaction_type: aiState.formData?.interaction_type || null,
          products_discussed: aiState.formData?.products_discussed || [],
          summary: aiState.formData?.summary || null,
          sentiment: aiState.formData?.sentiment || null,
          followup_date: aiState.formData?.followup_date || null,
          followup_action: aiState.formData?.followup_action || null,
          notes: aiState.formData?.notes || null,
        },
        recent_chat_messages: recentMessages,
        ...context,
      };

      const { data } = await api.post('/api/v1/ai/chat', {
        message,
        context: derivedContext,
      });
      return { sessionId: data.session_id, message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to start AI session.'
      );
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    // Chat
    messages: [],
    isThinking: false,

    // SSE streaming session
    sessionId: null,
    isStreaming: false,

    // Per-field streaming status: idle | filling | filled | error
    fieldStatus: { ...INITIAL_FIELD_STATUS },

    // Live form data (populated by AI or user)
    formData: { ...INITIAL_FORM },

    // True when a field was filled by AI (shows green indicator)
    aiGeneratedFields: {},

    // Set when agent completes (contains the saved interaction_id)
    completedInteractionId: null,

    // Special response payloads from search/summarize/followup tools
    hcpProfile: null,
    relationshipSummary: null,
    followupSuggestions: null,

    // Error
    error: null,
  },
  reducers: {
    /**
     * Called by the useSSE hook when any SSE event arrives.
     * Routes events to the correct state update.
     */
    sseEventReceived: (state, action) => {
      const {
        field, value, confidence, interaction_id, message, chat_only, model,
      } = action.payload;

      if (field === '__done__') {
        state.isStreaming = false;
        state.sessionId = null;
        state.isThinking = false;
        if (interaction_id) state.completedInteractionId = interaction_id;

        const last = state.messages[state.messages.length - 1];
        if (last?.role === 'assistant' && last.isStreaming) {
          last.isStreaming = false;
          if (model) last.model = model;
          if (message && !last.content) {
            last.content = message;
          }
        } else if (message) {
          state.messages.push({
            id: Date.now(), role: 'assistant', content: message, model: model || 'AI Agent',
          });
        }
        return;
      }

      if (field === '__error__') {
        state.isStreaming = false;
        state.sessionId = null;
        state.isThinking = false;
        state.error = message || 'AI agent encountered an error.';
        state.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: `⚠️ ${message || 'Something went wrong. Please try again.'}`,
          isError: true,
          model: model || 'AI Agent',
        });
        return;
      }

      if (field === '__message_start__') {
        state.isThinking = false;
        state.messages.push({
          id: `stream-${Date.now()}`,
          role: 'assistant',
          content: '',
          isStreaming: true,
          model: model || 'AI Assistant',
        });
        return;
      }

      if (field === '__message_chunk__') {
        state.isThinking = false;
        const last = state.messages[state.messages.length - 1];
        if (last?.role === 'assistant' && last.isStreaming) {
          if (model) last.model = model;
          last.content += message || '';
        } else {
          state.messages.push({
            id: `stream-${Date.now()}`,
            role: 'assistant',
            content: message || '',
            isStreaming: true,
            model: model || 'AI Assistant',
          });
        }
        return;
      }

      if (field === '__message__') {
        state.isThinking = false;
        if (message) {
          state.messages.push({
            id: Date.now(), role: 'assistant', content: message, model: model || 'AI Assistant',
          });
        }
        return;
      }

      // Chat-only tools — store structured data but do not touch the form
      if (field === 'hcp_profile') {
        state.hcpProfile = value;
        if (chat_only) return;
      }
      if (field === 'relationship_summary') {
        state.relationshipSummary = value;
        if (chat_only) return;
      }
      if (field === 'followup_suggestions') {
        state.followupSuggestions = value;
        if (chat_only) return;
      }

      // Regular form field extracted — mark as "filling" then update value
      if (state.fieldStatus[field] !== undefined) {
        state.fieldStatus[field] = 'filling';
      }

      // Map backend field name to formData key
      const fieldMap = {
        doctor_name: 'doctor_name',
        hospital: 'hospital',
        specialty: 'specialty',
        interaction_date: 'interaction_date',
        interaction_type: 'interaction_type',
        products_discussed: 'products_discussed',
        summary: 'summary',
        sentiment: 'sentiment',
        followup_date: 'followup_date',
        followup_action: 'followup_action',
        notes: 'notes',
      };

      const formKey = fieldMap[field];
      if (formKey && value !== null && value !== undefined) {
        state.formData[formKey] = value;
        state.aiGeneratedFields[formKey] = true;
        // Transition to "filled" state
        state.fieldStatus[field] = 'filled';
      }
    },

    /**
     * Mark a field as manually edited (removes AI indicator).
     */
    fieldManuallyEdited: (state, action) => {
      const field = action.payload;
      state.aiGeneratedFields[field] = false;
      if (state.fieldStatus[field] === 'filled') {
        state.fieldStatus[field] = 'idle';
      }
    },

    /**
     * Update a specific form field (from user input).
     */
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
      state.aiGeneratedFields[field] = false;
    },

    resetForm: (state) => {
      state.formData = { ...INITIAL_FORM };
      state.fieldStatus = { ...INITIAL_FIELD_STATUS };
      state.aiGeneratedFields = {};
      state.completedInteractionId = null;
      state.hcpProfile = null;
      state.relationshipSummary = null;
      state.followupSuggestions = null;
      state.error = null;
      state.sessionId = null;
      state.isStreaming = false;
      state.isThinking = false;
    },

    resetMessages: (state) => {
      state.messages = [];
    },

    clearAiError: (state) => {
      state.error = null;
    },

    setStreamingDone: (state) => {
      state.isStreaming = false;
      state.isThinking = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state, action) => {
        const userMsg = action.meta.arg.message;
        state.isThinking = true;
        state.error = null;
        // Add user message immediately (optimistic)
        state.messages.push({
          id: Date.now(),
          role: 'user',
          content: userMsg,
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sessionId = action.payload.sessionId;
        state.isStreaming = true;
        // isThinking stays true until __message__ or __done__ arrives
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isThinking = false;
        state.isStreaming = false;
        state.error = action.payload;
        state.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: `⚠️ ${action.payload}`,
          isError: true,
        });
      });
  },
});

export const {
  sseEventReceived,
  fieldManuallyEdited,
  updateFormField,
  resetForm,
  resetMessages,
  clearAiError,
  setStreamingDone,
} = aiSlice.actions;

export const selectAiMessages = (s) => s.ai.messages;
export const selectIsThinking = (s) => s.ai.isThinking;
export const selectSessionId = (s) => s.ai.sessionId;
export const selectIsStreaming = (s) => s.ai.isStreaming;
export const selectFieldStatus = (s) => s.ai.fieldStatus;
export const selectFormData = (s) => s.ai.formData;
export const selectAiGeneratedFields = (s) => s.ai.aiGeneratedFields;
export const selectCompletedInteractionId = (s) => s.ai.completedInteractionId;
export const selectHcpProfile = (s) => s.ai.hcpProfile;
export const selectRelationshipSummary = (s) => s.ai.relationshipSummary;
export const selectFollowupSuggestions = (s) => s.ai.followupSuggestions;
export const selectAiError = (s) => s.ai.error;

export default aiSlice.reducer;
