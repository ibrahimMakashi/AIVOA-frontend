export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const INTERACTION_TYPES = [
  { value: 'visit', label: 'In-Person Visit' },
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'conference', label: 'Conference / Event' },
  { value: 'webinar', label: 'Webinar' },
];

export const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive', color: 'success' },
  { value: 'neutral', label: 'Neutral', color: 'default' },
  { value: 'negative', label: 'Negative', color: 'error' },
];

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: '#C62828' },
  { value: 'medium', label: 'Medium', color: '#E65100' },
  { value: 'low', label: 'Low', color: '#2E7D32' },
];

export const NOTE_TYPES = [
  { value: 'general', label: 'General Note' },
  { value: 'objection', label: 'Objection' },
  { value: 'request', label: 'Request' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'commitment', label: 'Commitment' },
];

export const HCP_TIERS = [
  { value: 'A', label: 'Tier A — High Value', color: '#1565C0' },
  { value: 'B', label: 'Tier B — Medium Value', color: '#00695C' },
  { value: 'C', label: 'Tier C — Low Value', color: '#546E7A' },
];

export const STREAMING_FIELD_MAP = {
  doctor_name: 'Doctor Name',
  hospital: 'Hospital',
  specialty: 'Specialty',
  interaction_date: 'Meeting Date',
  interaction_type: 'Interaction Type',
  products_discussed: 'Products Discussed',
  summary: 'Discussion Summary',
  sentiment: 'Sentiment',
  followup_date: 'Follow-up Date',
  followup_action: 'Follow-up Action',
  hcp_profile: 'HCP Profile',
  relationship_summary: 'Relationship Summary',
  followup_suggestions: 'Follow-up Suggestions',
};

export const TOKEN_KEY = 'crm_access_token';
export const REFRESH_TOKEN_KEY = 'crm_refresh_token';
export const USER_KEY = 'crm_user';
