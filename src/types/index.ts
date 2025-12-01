// Shared types and interfaces for the application

// ==================== User Types ====================
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  supaadmin?: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  // HubSpot fields (may be present when fetched from API)
  client_type?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  address?: string;
  lifecyclestage?: string;
  // Computed name field (may be present in some API responses)
  name?: string;
}

export interface UserStatistics {
  total: number;
  verified: number;
  unverified: number;
  admins: number;
  users: number;
}

// ==================== Option Types (Category, SubCategory, Type, Strategy, Requirement, Source) ====================
export interface Category {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Type {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Strategy {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Requirement {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Source {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Deal Types ====================
export interface Deal {
  _id: string;
  name: string;
  url?: string;
  image?: string;
  category: Array<Category>;
  subCategory: Array<SubCategory>;
  type: Array<Type>;
  strategy: Array<Strategy>;
  requirement: Array<Requirement>;
  source: Source | null;
  createdBy: { _id: string; name: string } | string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
}

export interface FilterOptions {
  categories: Array<{ id: string; name: string }>;
  subCategories: Array<{ id: string; name: string }>;
  types: Array<{ id: string; name: string }>;
  strategies: Array<{ id: string; name: string }>;
  requirements: Array<{ id: string; name: string }>;
  sources: Array<{ id: string; name: string }>;
}

// ==================== Course Types ====================
export interface CourseGroup {
  _id: string;
  title: string; // Backend uses 'title', not 'name'
  description: string;
  icon: string; // Backend uses 'icon', not 'image'
  courses?: Course[];
  createdBy: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
  hubSpotListIds?: string[];
}

export interface CourseResource {
  name: string;
  url: string;
  type: 'ebook' | 'pdf' | 'spreadsheet' | 'url' | 'other';
}

export interface Course {
  _id: string;
  title: string; // Backend uses 'title', not 'name'
  description: string;
  courseGroup: string | CourseGroup;
  lectures?: Lecture[];
  resources?: CourseResource[]; // Array of resources with name, url, type
  createdBy: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
  // Legacy fields for backward compatibility (deprecated)
  ebookName?: string;
  ebookUrl?: string;
}

export interface LectureRelatedFile {
  name: string;
  uploadedUrl: string;
}

export interface Lecture {
  _id: string;
  title: string; // Backend uses 'title', not 'name'
  description?: string;
  content?: string; // Rich text content
  videoUrl?: string; // Video URL (MP4, WebM, OGG, etc.)
  relatedFiles?: LectureRelatedFile[]; // Array of related files with name and uploadedUrl
  completedBy?: string[]; // Array of user IDs who completed this lecture
  createdBy?: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
}

// ==================== Webinar Types ====================
export interface WebinarCTA {
  label: string;
  link: string;
}

export interface WebinarAttendee {
  user: string | User;
  attendanceStatus: "registered" | "attended" | "missed";
  registeredAt: string;
}

export interface Webinar {
  _id: string;
  name: string;
  slug: string;
  date: string; // Date stored in UTC
  streamType: "Live Call" | "Webinar";
  status: "Scheduled" | "Waiting" | "In Progress" | "Ended"; // Backend enum values
  line1: string; // Required
  line2?: string; // Optional
  line3?: string; // Optional
  displayComments: "Yes" | "No";
  portalDisplay: "Yes" | "No";
  // Optional fields
  calInvDesc?: string;
  proWorkId?: string;
  reminderSms?: string;
  proSmsList?: string | { _id: string; name: string };
  proSms?: string;
  proSmsTime?: number; // in minutes, default 60
  attendOverwrite?: number; // default 100
  rawRecordingId?: string;
  recording?: string;
  ctas?: WebinarCTA[]; // Array of call-to-action buttons
  attendees?: WebinarAttendee[];
  createdBy?: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Chat Message Types ====================
export interface ChatMessage {
  _id: string;
  webinar: string | Webinar;
  senderUserId?: string;
  senderName: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== API Response Types ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Form Types ====================
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: "user" | "admin";
  sendVerificationEmail?: boolean;
  createHubSpotContact?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: "user" | "admin";
  supaadmin?: boolean;
  isVerified?: boolean;
}

// ==================== Field Selection Types ====================
export type FieldSelection = "basic" | "detailed" | "full";

// ==================== Route Types ====================
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiresSupaadmin?: boolean;
}

