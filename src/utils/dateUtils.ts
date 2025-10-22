/**
 * Date Utility Functions
 * 
 * IMPORTANT: Date Handling Strategy Across the Application
 * =========================================================
 * 
 * 1. STORAGE (Backend/MongoDB):
 *    - MongoDB ALWAYS stores dates in UTC
 *    - Models use `timestamps: true` for automatic createdAt/updatedAt in UTC
 *    - Date fields in schemas (e.g., Webinar.date) are stored as Date type in UTC
 * 
 * 2. DISPLAY (Frontend):
 *    - Always convert UTC dates to user's local timezone for display
 *    - Use the utilities below for consistent formatting
 *    - new Date(utcString) automatically converts to local timezone
 * 
 * 3. INPUT/EDITING (Forms):
 *    - datetime-local inputs expect local timezone format
 *    - When loading data for edit: Convert UTC → Local using formatDateForInput()
 *    - When submitting data: Convert Local → UTC using new Date(localString).toISOString()
 *    - NEVER double-convert! Only convert once in each direction
 * 
 * 4. ANTI-PATTERNS TO AVOID:
 *    ❌ new Date(utcString).toISOString() for datetime-local inputs (this keeps UTC, doesn't convert to local)
 *    ❌ Manually adding/subtracting timezone offsets multiple times (causes double-conversion)
 *    ❌ Converting dates before display without considering user's timezone
 */

/**
 * Format a UTC date string to user's local date
 * Example: "2024-03-15T18:30:00.000Z" → "Mar 15, 2024"
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString); // MongoDB stores in UTC, Date constructor handles conversion
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format a UTC date string to user's local date and time
 * Example: "2024-03-15T18:30:00.000Z" → "Mar 15, 2024, 2:30 PM"
 */
export const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString); // MongoDB stores in UTC, Date constructor handles conversion
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format a UTC date string to user's local time only
 * Example: "2024-03-15T18:30:00.000Z" → "2:30 PM"
 */
export const formatTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString); // MongoDB stores in UTC, Date constructor handles conversion
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Convert UTC date to local timezone for datetime-local input
 * This is used when populating edit forms
 * 
 * Example: 
 *   UTC: "2024-03-15T18:30:00.000Z" 
 *   → Local (PST): "2024-03-15T10:30" (format required by datetime-local input)
 * 
 * IMPORTANT: This function prevents double-conversion by explicitly converting
 * the UTC date to local time format required by HTML5 datetime-local inputs
 */
export const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString); // MongoDB UTC date

    // Get the local timezone offset and adjust
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - offset); // Convert to local time

    // Return in YYYY-MM-DDTHH:MM format (required by datetime-local input)
    return localDate.toISOString().slice(0, 16);
};

/**
 * Convert local datetime-local input value to UTC ISO string for MongoDB
 * This is used when submitting forms
 * 
 * Example:
 *   Local input: "2024-03-15T10:30" (user's local time)
 *   → UTC: "2024-03-15T18:30:00.000Z" (stored in MongoDB)
 * 
 * IMPORTANT: datetime-local input provides value in local timezone
 * new Date() interprets it as local time, then toISOString() converts to UTC
 */
export const convertLocalToUTC = (localDateString: string): string | null => {
    if (!localDateString) return null;
    return new Date(localDateString).toISOString();
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (Math.abs(diffMin) < 1) return 'just now';
    if (Math.abs(diffMin) < 60) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''} ${diffMs < 0 ? 'ago' : 'from now'}`;
    if (Math.abs(diffHour) < 24) return `${Math.abs(diffHour)} hour${Math.abs(diffHour) !== 1 ? 's' : ''} ${diffMs < 0 ? 'ago' : 'from now'}`;
    if (Math.abs(diffDay) < 30) return `${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? 's' : ''} ${diffMs < 0 ? 'ago' : 'from now'}`;

    return formatDate(dateString);
};

