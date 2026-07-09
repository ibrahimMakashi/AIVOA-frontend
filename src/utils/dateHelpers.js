import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const formatDate = (date) => {
  if (!date) return '—';
  return dayjs(date).format('DD MMM YYYY');
};

export const formatDatetime = (date) => {
  if (!date) return '—';
  return dayjs(date).format('DD MMM YYYY, h:mm A');
};

export const fromNow = (date) => {
  if (!date) return '—';
  return dayjs(date).fromNow();
};

export const isOverdue = (date) => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const isDueToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isDueSoon = (date, days = 3) => {
  if (!date) return false;
  const due = dayjs(date);
  const today = dayjs();
  return due.isAfter(today) && due.diff(today, 'day') <= days;
};

export const toISODate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

export const today = () => dayjs().format('YYYY-MM-DD');
