/**
 * useSSE — Custom hook for consuming the backend SSE stream.
 *
 * When sessionId changes to a non-null value, opens an EventSource
 * to GET /api/v1/ai/stream/{sessionId}. Dispatches every received
 * event to Redux via sseEventReceived, which routes to the correct
 * state update in aiSlice.
 *
 * Cleans up the EventSource on:
 * - Component unmount
 * - sessionId becoming null
 * - Terminal events (__done__ or __error__)
 */

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { sseEventReceived } from '../features/ai/aiSlice';
import { showNotification } from '../features/notifications/notificationSlice';
import { API_BASE_URL } from '../utils/constants';

const useSSE = (sessionId) => {
  const dispatch = useDispatch();
  const esRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const url = `${API_BASE_URL}/api/v1/ai/stream/${sessionId}`;
    const eventSource = new EventSource(url);
    esRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        dispatch(sseEventReceived(data));

        // Close the stream on terminal events
        if (data.field === '__done__' || data.field === '__error__') {
          eventSource.close();
          esRef.current = null;

          if (data.field === '__done__' && data.interaction_id) {
            dispatch(
              showNotification({
                message: 'Interaction logged successfully by AI.',
                severity: 'success',
              })
            );
          }
        }
      } catch (e) {
        console.error('[useSSE] Failed to parse event:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[useSSE] EventSource error:', err);
      // SSE errors are often just the stream closing — only report if streaming was ongoing
      if (eventSource.readyState !== EventSource.CLOSED) {
        dispatch(
          sseEventReceived({
            field: '__error__',
            message: 'Connection to AI stream was interrupted.',
          })
        );
        dispatch(
          showNotification({
            message: 'AI stream connection interrupted.',
            severity: 'warning',
          })
        );
      }
      eventSource.close();
      esRef.current = null;
    };

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [sessionId, dispatch]);
};

export default useSSE;
