export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  };
  return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const formatCalories = (cal) => {
  if (!cal && cal !== 0) return '0 kcal';
  return `${Number(cal).toLocaleString()} kcal`;
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString();
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
