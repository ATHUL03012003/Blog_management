export default function parseApiError(err) {
  const data = err.response?.data;
  if (data?.error) return data.error;
  if (typeof data === 'object' && data !== null) {
    const key = Object.keys(data)[0];
    const val = data[key];
    return Array.isArray(val) ? `${key}: ${val[0]}` : `${key}: ${val}`;
  }
  return 'Something went wrong. Please try again.';
}
