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
  client_type?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserStatistics {
  total: number;
  verified: number;
  unverified: number;
  admins: number;
  users: number;
  recentUsers: number;
  recentActiveUsers: number;
}

// ==================== Deal Types ====================
export interface Deal {
  _id: string;
  name: string;
  url?: string;
  image?: string;
  category: Array<{ _id: string; name: string }>;
  subCategory: Array<{ _id: string; name: string }>;
  type: Array<{ _id: string; name: string }>;
  strategy: Array<{ _id: string; name: string }>;
  requirement: Array<{ _id: string; name: string }>;
  source: { _id: string; name: string };
  createdBy: { _id: string; name: string };
  createdAt?: string;
  updatedAt: string;
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

export type Status = "Scheduled" | "Waiting" | "In Progress" | "Ended";
export type PortalDisplay = "Yes" | "No";
export type StreamType = "Live Call" | "Webinar";
export type AttendanceStatus = "registered" | "attended" | "missed";
export type Role = "user" | "admin";
export type ClientType = "individual" | "business";
export type VerificationStatus = "verified" | "unverified";
export type DisplayOnPublicPage = boolean;

// ==================== Course Types ====================
export interface CourseGroup {
  _id: string;
  title: string;
  description: string;
  icon: string;
  courses?: Course[];
  createdBy?: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
  hubSpotListIds?: string[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  courseGroup: string | CourseGroup;
  lectures?: Lecture[];
  resources?: Array<{
    name: string;
    url: string;
    type?: 'ebook' | 'pdf' | 'spreadsheet' | 'url' | 'other';
  }>;
  createdBy?: { _id: string; name: string; email: string } | string;
  // Legacy fields for backward compatibility (deprecated)
  ebookName?: string;
  ebookUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
}

export interface CourseResource {
  name: string;
  url: string;
  type?: 'ebook' | 'pdf' | 'spreadsheet' | 'url' | 'other';
}

// Related file type for lectures (used in file uploads)
export interface RelatedFile {
  name?: string;
  uploadedUrl?: string;
  file?: File;
}

export interface Lecture {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  relatedFiles?: Array<{
    name?: string;
    uploadedUrl?: string;
    file?: File;
  }>;
  completedBy?: Array<string | { _id: string; name: string; email: string }>;
  createdBy?: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
  displayOnPublicPage?: boolean;
  // Legacy fields for backward compatibility
  course?: string | Course;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  fileUrl?: string;
  order?: number;
  isCompleted?: boolean;
}

// ==================== Webinar Types ====================
export interface Webinar {
  _id: string;
  name: string;
  date: string;
  time?: string;
  streamType: string;
  status: "Scheduled" | "Waiting" | "In Progress" | "Ended";
  portalDisplay: "Yes" | "No";
  slug: string;
  line1?: string;
  line2?: string;
  line3?: string;
  recording?: string;
  rawRecordingId?: string;
  ctas?: Array<{ label: string; link: string }>;
  activeCtaIndices?: number[];
  attendees?: WebinarAttendee[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WebinarAttendee {
  user: string | User;
  attendanceStatus: "registered" | "attended" | "missed";
  registeredAt: string;
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

// Pagination response type for course API (matches backend structure)
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Delete response type
export interface DeleteResponse {
  message: string;
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

// ==================== Component Props Types ====================

// Modal Props
export interface LectureModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingLecture?: Lecture | null;
  onLectureSaved: (lectureData?: Lecture, isUpdate?: boolean) => void;
  courseId?: string;
}

export interface CourseModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingCourse?: Course | null;
  onCourseSaved: (courseData?: Course, isUpdate?: boolean) => void;
  courseGroupId?: string;
}

export interface GroupModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingGroup?: CourseGroup | null;
  onGroupSaved: (groupData?: CourseGroup, isUpdate?: boolean) => void;
}

export interface ContentModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  editingLecture?: Lecture | null;
  selectedCourseId?: string;
  onContentSaved: (lectureData?: Lecture, isUpdate?: boolean) => void;
}

// ==================== Route Types ====================
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiresSupaadmin?: boolean;
}

