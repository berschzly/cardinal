// Date formatting/calculations

/**
 * Formats a date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'medium'
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'medium') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Formats date to MM/DD/YYYY
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Formats date to YYYY-MM-DD (for input fields)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets relative time string (e.g., "2 days ago", "in 5 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 7) return `In ${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < -7) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
  
  return formatDate(date, 'short');
}

/**
 * Calculates days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} - Days difference
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days until a date
 * @param {Date|string} date - Future date
 * @returns {number} - Days until date (negative if past)
 */
export function daysUntil(date) {
  if (!date) return null;
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is past
 */
export function isPast(date) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < now;
}

/**
 * Checks if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is future
 */
export function isFuture(date) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d > now;
}

/**
 * Checks if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
export function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Adds days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Days to add (negative to subtract)
 * @returns {Date} - New date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets expiration status and urgency level
 * @param {Date|string} expirationDate - Expiration date
 * @returns {object} - { status: string, urgency: string, daysLeft: number }
 */
export function getExpirationStatus(expirationDate) {
  if (!expirationDate) {
    return { status: 'No expiration', urgency: 'none', daysLeft: null };
  }
  
  const days = daysUntil(expirationDate);
  
  if (days < 0) {
    return { 
      status: 'Expired', 
      urgency: 'expired', 
      daysLeft: days,
      message: `Expired ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago`
    };
  }
  
  if (days === 0) {
    return { 
      status: 'Expires today', 
      urgency: 'critical', 
      daysLeft: 0,
      message: 'Expires today!'
    };
  }
  
  if (days === 1) {
    return { 
      status: 'Expires tomorrow', 
      urgency: 'critical', 
      daysLeft: 1,
      message: 'Expires tomorrow'
    };
  }
  
  if (days <= 7) {
    return { 
      status: 'Expiring soon', 
      urgency: 'high', 
      daysLeft: days,
      message: `Expires in ${days} days`
    };
  }
  
  if (days <= 30) {
    return { 
      status: 'Expires this month', 
      urgency: 'medium', 
      daysLeft: days,
      message: `Expires in ${days} days`
    };
  }
  
  return { 
    status: 'Active', 
    urgency: 'low', 
    daysLeft: days,
    message: `Expires ${formatDate(expirationDate, 'short')}`
  };
}

/**
 * Formats a timestamp to time ago (e.g., "2 hours ago")
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} - Formatted time ago string
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * Gets dates for notification scheduling
 * @param {Date|string} expirationDate - Expiration date
 * @returns {object} - Object with notification dates
 */
export function getNotificationDates(expirationDate) {
  if (!expirationDate) return null;
  
  const expDate = new Date(expirationDate);
  
  return {
    thirtyDays: addDays(expDate, -30),
    fourteenDays: addDays(expDate, -14),
    sevenDays: addDays(expDate, -7),
    oneDay: addDays(expDate, -1),
    expirationDate: expDate
  };
}

/**
 * Checks if notification should be sent
 * @param {Date|string} expirationDate - Expiration date
 * @param {number} daysBeforeExpiration - Days before (30, 14, 7, 1)
 * @returns {boolean} - True if should send notification today
 */
export function shouldSendNotification(expirationDate, daysBeforeExpiration) {
  if (!expirationDate) return false;
  
  const days = daysUntil(expirationDate);
  return days === daysBeforeExpiration;
}