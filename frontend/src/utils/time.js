export function formatTimestampToLocale(val) {
  if (!val) return '';
  // Firestore Timestamp has `seconds` and `nanoseconds`
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date(val.seconds * 1000).toLocaleString();
  }
  // ISO string or Date
  try {
    const d = (val instanceof Date) ? val : new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleString();
  } catch (e) {}
  return String(val);
}

export function formatTimestampToTime(val) {
  if (!val) return '';
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date(val.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  try {
    const d = (val instanceof Date) ? val : new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {}
  return String(val);
}
