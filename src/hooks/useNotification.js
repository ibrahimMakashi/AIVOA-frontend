import { useDispatch } from 'react-redux';
import {
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyWarning,
} from '../features/notifications/notificationSlice';

const useNotification = () => {
  const dispatch = useDispatch();
  return {
    success: (msg) => dispatch(notifySuccess(msg)),
    error: (msg) => dispatch(notifyError(msg)),
    info: (msg) => dispatch(notifyInfo(msg)),
    warning: (msg) => dispatch(notifyWarning(msg)),
  };
};

export default useNotification;
