import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";


export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log(import.meta.env.VITE_BACKEND_URL);


// Flag to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let pendingRequestsQueue: Array<(token: string | null) => void> = [];

const getAccessToken = (): string | null => localStorage.getItem("accessToken");
const getRefreshToken = (): string | null => localStorage.getItem("refreshToken");
const setAccessToken = (token: string) => localStorage.setItem("accessToken", token);

// Attach Authorization header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }


  return config;
});

// Response interceptor to handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If unauthorized and we haven't retried yet, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token available -> propagate error
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve) => {
          pendingRequestsQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              } as any;
            }
            resolve(api(originalRequest));
          });
        });
      }

      try {
        isRefreshing = true;
        const { data } = await api.post("/api/auth/refresh", { refreshToken });
        const newAccessToken = data?.accessToken as string | undefined;
        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }
        setAccessToken(newAccessToken);

        // Process queued requests
        pendingRequestsQueue.forEach((cb) => cb(newAccessToken));
        pendingRequestsQueue = [];

        // Retry the original request with new token
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        } as any;
        return api(originalRequest);
      } catch (refreshError) {
        // On refresh failure, clear tokens and fail queued requests
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        pendingRequestsQueue.forEach((cb) => cb(null));
        pendingRequestsQueue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Deal API functions - OPTIMIZED
export const dealApi = {
  // Get all deals with field selection
  getAllDeals: (fields: 'basic' | 'detailed' | 'full' = 'basic') =>
    api.get(`/api/deals?fields=${fields}`),

  // Get deal by ID with field selection
  getDealById: (dealId: string, fields: 'basic' | 'detailed' | 'full' = 'full') =>
    api.get(`/api/deals/${dealId}?fields=${fields}`),

  // Create new deal
  createDeal: (dealData: any) => api.post('/api/deals', dealData),

  // Update deal
  updateDeal: (dealId: string, dealData: any) => api.put(`/api/deals/${dealId}`, dealData),

  // Delete deal
  deleteDeal: (dealId: string) => api.delete(`/api/deals/${dealId}`),

  // Filter deals with field selection
  filterDeals: (filters: any, fields: 'basic' | 'detailed' | 'full' = 'basic') =>
    api.get('/api/deals/filter', { params: { ...filters, fields } }),
};


// Options API functions for dropdowns
export const optionsApi = {
  // Get all categories
  getCategories: () => api.get('/api/categories'),

  // Get all subcategories
  getSubCategories: () => api.get('/api/sub-categories'),

  // Get all types
  getTypes: () => api.get('/api/types'),

  // Get all strategies
  getStrategies: () => api.get('/api/strategies'),

  // Get all requirements
  getRequirements: () => api.get('/api/requirements'),

  // Get all sources
  getSources: () => api.get('/api/sources'),
};

// Course API functions - OPTIMIZED
export const courseApi = {
  // Course Groups with field selection
  getAllCourseGroups: (filters?: { type?: string; search?: string }, fields: 'basic' | 'detailed' | 'full' = 'basic') => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    params.append('fields', fields);
    return api.get(`/api/courses/groups?${params.toString()}`);
  },
  createCourseGroup: (groupData: any) => api.post('/api/courses/groups', groupData),
  getCourseGroupById: (groupId: string, fields: 'basic' | 'detailed' | 'full' = 'full') =>
    api.get(`/api/courses/groups/${groupId}?fields=${fields}`),
  updateCourseGroup: (groupId: string, groupData: any) => api.put(`/api/courses/groups/${groupId}`, groupData),
  deleteCourseGroup: (groupId: string) => api.delete(`/api/courses/groups/${groupId}`),

  // Courses with field selection
  getAllCourses: (fields: 'basic' | 'detailed' | 'full' = 'basic') =>
    api.get(`/api/courses/courses?fields=${fields}`),
  createCourse: (courseData: any, courseGroupId: string) => {
    const data = courseData;
    return api.post(`/api/courses/courses/${courseGroupId}`, data);
  },
  getCourseById: (courseId: string, fields: 'basic' | 'detailed' | 'full' = 'full') =>
    api.get(`/api/courses/courses/${courseId}?fields=${fields}`),
  updateCourse: (courseId: string, courseData: any) => api.put(`/api/courses/courses/${courseId}`, courseData),
  deleteCourse: (courseId: string) => api.delete(`/api/courses/courses/${courseId}`),

  // Lectures
  getAllLectures: () => api.get('/api/courses/lectures'),
  createLecture: (lectureData: any) => api.post('/api/courses/lectures', lectureData),
  getLectureById: (lectureId: string) => api.get(`/api/courses/lectures/${lectureId}`),
  updateLecture: (lectureId: string, lectureData: any) => api.put(`/api/courses/lectures/${lectureId}`, lectureData),
  deleteLecture: (lectureId: string) => api.delete(`/api/courses/lectures/${lectureId}`),
  completeLecture: (lectureId: string) => api.post(`/api/courses/lectures/${lectureId}/complete`),

  // Image upload
  uploadImage: (formData: FormData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // File upload (for all file types)
  uploadFile: (formData: FormData) => api.post('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Save YouTube video URL to lecture
  saveYouTubeVideo: (lectureId: string, videoData: {
    youtubeUrl: string;
    title?: string;
    description?: string;
    videoId?: string;
  }) => api.post(`/api/courses/lectures/${lectureId}/youtube`, videoData),
};

// Image upload API
export const imageApi = {
  // Upload image (legacy - through backend)
  uploadImage: (formData: FormData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  // Get signed upload URL for direct upload
  getSignedUploadUrl: (filename: string, contentType: string) =>
    api.post('/api/upload/image/signed-url', { filename, contentType }),
};

// File upload API (for all file types)
export const fileApi = {
  // Upload file (legacy - through backend)
  uploadFile: (formData: FormData, config?: any) => api.post('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config
  }),
  // Get signed upload URL for direct upload
  getSignedUploadUrl: (filename: string, contentType: string) =>
    api.post('/api/upload/file/signed-url', { filename, contentType }),
};

// Webinar API functions - OPTIMIZED
export const webinarApi = {

  getDownloadLink: (rawRecordingId: string) => api.get(`/api/webinars/admin/${rawRecordingId}/download-link`),

  setWebinarOnRecording: (slug: string) => api.post(`/api/webinars/admin/${slug}/on-recording`),

  // Admin functions
  getAllWebinars: (fields: 'basic' | 'detailed' | 'full' = 'basic', filters?: { status?: string; streamType?: string; orderBy?: string; order?: 'asc' | 'desc' }) => {
    const params = new URLSearchParams();
    params.append('fields', fields);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.streamType) params.append('streamType', filters.streamType);
    if (filters?.orderBy) params.append('orderBy', filters.orderBy);
    if (filters?.order) params.append('order', filters.order);
    return api.get(`/api/webinars/admin?${params.toString()}`);
  },

  getWebinarById: (webinarId: string, fields: 'basic' | 'detailed' | 'full' = 'full') =>
    api.get(`/api/webinars/user/${webinarId}?fields=${fields}`),

  createWebinar: (webinarData: any) => api.post('/api/webinars/admin', webinarData),

  updateWebinar: (webinarId: string, webinarData: any) => api.put(`/api/webinars/admin/${webinarId}`, webinarData),

  deleteWebinar: (webinarId: string) => api.delete(`/api/webinars/admin/${webinarId}`),

  getWebinarAttendees: (webinarId: string) => api.get(`/api/webinars/admin/${webinarId}/attendees`),

  markUserAsAttended: (webinarId: string, userId: string) =>
    api.post(`/api/webinars/admin/${webinarId}/user/${userId}/attend`),

  markUserAsMissed: (webinarId: string, userId: string) =>
    api.post(`/api/webinars/admin/${webinarId}/user/${userId}/missed`),

  endWebinar: (webinarId: string) => api.post(`/api/webinars/admin/${webinarId}/end`),

  // Public/User functions
  getPublicWebinars: (fields: 'basic' | 'detailed' | 'full' = 'basic', filters?: { status?: string; streamType?: string }) => {
    const params = new URLSearchParams();
    params.append('fields', fields);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.streamType) params.append('streamType', filters.streamType);
    return api.get(`/api/webinars/public?${params.toString()}`);
  },

  getPublicWebinarById: (webinarId: string) => api.get(`/api/webinars/public/${webinarId}`),

  getPublicWebinarBySlug: (slug: string) => api.get(`/api/webinars/public/${slug}`),

  registerForWebinar: (webinarId: string, email: string) => api.post(`/api/webinars/${webinarId}/register`, { email }),

  isValidEmailAddress: (email: string) => api.post(`/api/webinars/isValidEmailAddress`, { email }),

  unregisterFromWebinar: (webinarId: string) => api.delete(`/api/webinars/${webinarId}/unregister`),

  markAsAttended: (webinarId: string) => api.post(`/api/webinars/${webinarId}/attend`),

  // Chat functions
  saveChatMessage: (webinarId: string, messageData: { senderUserId: string; senderName: string; text: string }) =>
    api.post(`/api/webinars/${webinarId}/chat`, messageData),

  getChatMessages: (webinarId: string) => api.get(`/api/webinars/${webinarId}/chat`),

  clearChatMessages: (webinarId: string) => api.delete(`/api/webinars/${webinarId}/chat`),
};

// User Management API functions
export const userApi = {
  // Get all users with pagination, filtering, and sorting
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isVerified?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isVerified !== undefined) queryParams.append('isVerified', params.isVerified);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);
    return api.get(`/api/users?${queryParams.toString()}`);
  },

  // Get user by ID
  getUserById: (userId: string) => api.get(`/api/users/${userId}`),

  // Create new user
  createUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role?: 'user' | 'admin';
    sendVerificationEmail?: boolean;
    createHubSpotContact?: boolean;
  }) => api.post('/api/users', userData),

  // Update user
  updateUser: (userId: string, userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: 'user' | 'admin';
    supaadmin?: boolean;
    isVerified?: boolean;
  }) => api.put(`/api/users/${userId}`, userData),

  // Delete user
  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),

  // Reset user password
  resetUserPassword: (userId: string, data?: { newPassword?: string; sendEmail?: boolean }) =>
    api.post(`/api/users/${userId}/reset-password`, data || {}),

  // Toggle user verification
  toggleUserVerification: (userId: string, isVerified: boolean) =>
    api.patch(`/api/users/${userId}/verification`, { isVerified }),

  // Change user role
  changeUserRole: (userId: string, role: 'user' | 'admin') =>
    api.patch(`/api/users/${userId}/role`, { role }),

  // Get user statistics
  getUserStatistics: () => api.get('/api/users/statistics'),

  // Bulk update users
  bulkUpdateUsers: (userIds: string[], updates: { role?: 'user' | 'admin'; isVerified?: boolean }) =>
    api.post('/api/users/bulk/update', { userIds, updates }),

  // Bulk delete users
  bulkDeleteUsers: (userIds: string[]) =>
    api.post('/api/users/bulk/delete', { userIds }),
};