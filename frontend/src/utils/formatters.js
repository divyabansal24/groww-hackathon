/**
 * Format standard Indian Rupee price (e.g. ₹2,980.50)
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format positive/negative percentage (e.g. +1.25%, -0.80%)
 */
export function formatPercent(percent, includeSign = true) {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '—';
  }
  const prefix = includeSign && percent > 0 ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
}

/**
 * Format date/timestamp to readable time string (e.g. 11:35 AM)
 */
export function formatTimestamp(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '—';
  }
}

/**
 * Format relative time text ("Just now", "5 mins ago", "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return 'Never checked';
  try {
    const past = new Date(isoString);
    const now = new Date();
    const diffMs = now - past;
    
    if (diffMs < 0 || isNaN(diffMs)) return 'Just now';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 45) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  } catch {
    return 'Never checked';
  }
}
