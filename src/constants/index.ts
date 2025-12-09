// Application-wide constants

// ==================== API Configuration ====================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    USER: "/api/auth/user",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
  },
  USERS: {
    BASE: "/api/users",
    STATISTICS: "/api/users/statistics",
    BULK_UPDATE: "/api/users/bulk/update",
    BULK_DELETE: "/api/users/bulk/delete",
    MIGRATE_HUBSPOT: "/api/users/migrate/hubspot",
  },
  DEALS: {
    BASE: "/api/deals",
    FILTER: "/api/deals/filter",
    STAR: "/api/deals/star",
    STARRED: "/api/deals/starred",
  },
  COURSES: {
    GROUPS: "/api/courses/groups",
    COURSES: "/api/courses/courses",
    LECTURES: "/api/courses/lectures",
  },
  WEBINARS: {
    ADMIN: "/api/webinars/admin",
    PUBLIC: "/api/webinars/public",
    REGISTER: "/api/webinars",
    CHAT: "/api/webinars",
  },
  UPLOAD: {
    IMAGE: "/api/upload/image",
    FILE: "/api/upload/file",
    IMAGE_SIGNED_URL: "/api/upload/image/signed-url",
    FILE_SIGNED_URL: "/api/upload/file/signed-url",
  },
  OPTIONS: {
    CATEGORIES: "/api/categories",
    SUB_CATEGORIES: "/api/sub-categories",
    TYPES: "/api/types",
    STRATEGIES: "/api/strategies",
    REQUIREMENTS: "/api/requirements",
    SOURCES: "/api/sources",
  },
} as const;

// ==================== Local Storage Keys ====================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_PREFERENCES: "userPreferences",
} as const;

// ==================== User Roles ====================
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

// ==================== Webinar Status ====================
export const WEBINAR_STATUS = {
  UPCOMING: "upcoming",
  LIVE: "live",
  ENDED: "ended",
  REPLAY: "replay",
} as const;

// ==================== Webinar Stream Types ====================
export const WEBINAR_STREAM_TYPES = {
  LIVE: "live",
  REPLAY: "replay",
} as const;

// ==================== Pagination Defaults ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// ==================== Field Selection Options ====================
export const FIELD_SELECTION = {
  BASIC: "basic",
  DETAILED: "detailed",
  FULL: "full",
} as const;

// ==================== Filter Tabs ====================
export const WEBINAR_FILTER_TABS = [
  { label: "UPCOMING" },
  { label: "REPLAYS" },
  { label: "WATCHED" },
] as const;

// ==================== Date Formats ====================
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy 'at' h:mm a",
  API: "yyyy-MM-dd",
  TIME: "h:mm a",
} as const;

// ==================== File Upload ====================
export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// ==================== Error Messages ====================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UPLOAD_ERROR: "File upload failed. Please try again.",
} as const;

// ==================== Success Messages ====================
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  SAVE_SUCCESS: "Saved successfully",
  DELETE_SUCCESS: "Deleted successfully",
  UPDATE_SUCCESS: "Updated successfully",
  UPLOAD_SUCCESS: "File uploaded successfully",
} as const;

