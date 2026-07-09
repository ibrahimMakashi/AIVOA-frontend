# AIVOA Frontend

React + Vite frontend for the AI-first HCP CRM. It provides the split-screen interaction logging UI, AI chat panel, Redux state management, and live SSE updates from the backend.

## Stack

- React
- Vite
- Redux Toolkit
- React Router
- Material UI
- Axios

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create or update `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start the frontend

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

## How It Works

1. The user types a message in the AI assistant.
2. Redux sends the message to the backend AI endpoint.
3. The backend returns a `session_id`.
4. The frontend opens an SSE stream for that session.
5. Incoming SSE events update either:
   - the interaction form, or
   - the chat panel

## Main Screens

- Dashboard
- HCP Directory
- Interaction History
- Log Interaction
- Settings

## AI Workflow in the UI

### Logging and editing flows
- The AI can fill the form field by field.
- Each incoming field is marked as AI-generated.
- Text fields animate with a typing effect.
- The form panel is the main scrollable area.

### Chat-only flows
- Profile lookup, follow-up suggestions, and relationship summaries stream into the right chat panel.
- These flows do not create a new interaction or overwrite the form unless explicitly intended.

## Short Workflow for Each Tool

### 1. `log_interaction`
- User describes a meeting or call
- Backend extracts fields
- Frontend receives streamed form updates
- Interaction is marked as saved by AI

### 2. `edit_interaction`
- User asks to correct an existing interaction
- Backend updates the current interaction from context
- Frontend updates the changed fields live

### 3. `search_hcp`
- User asks for a profile or history
- Backend fetches data and asks the LLM to write a briefing
- Frontend streams the answer in chat only

### 4. `generate_followup_suggestions`
- User asks what to do next with a doctor
- Backend gathers history, generates suggestions, and rewrites them into a natural action plan
- Frontend streams the result in chat

### 5. `summarize_relationship`
- User asks for an overview of the relationship
- Backend analyzes past interactions and creates a narrative summary
- Frontend streams the summary in chat

## Important Files

```text
src/
  App.jsx
  main.jsx
  components/layout/        app shell, top bar, sidebar
  features/ai/              AI page, slice, chat panel, form panel
  features/hcp/             HCP directory
  features/interactions/    interaction history and create flow
  services/api.js           axios client
  hooks/useSSE.js           SSE stream consumer
```

## Notes

- The frontend expects the backend to be running first.
- AI chat and form updates depend on the SSE stream endpoint from the backend.
- If API calls fail locally, check:
  - backend is running on port `8000`
  - `VITE_API_BASE_URL` is correct
  - backend CORS settings include `http://localhost:5173`
