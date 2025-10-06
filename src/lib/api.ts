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
  // Upload image
  uploadImage: (formData: FormData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// File upload API (for all file types)
export const fileApi = {
  // Upload file
  uploadFile: (formData: FormData, config?: any) => api.post('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config
  }),
};

// Webinar API functions - OPTIMIZED
export const webinarApi = {
  // Admin functions
  getAllWebinars: (fields: 'basic' | 'detailed' | 'full' = 'basic', filters?: { status?: string; streamType?: string }) => {
    const params = new URLSearchParams();
    params.append('fields', fields);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.streamType) params.append('streamType', filters.streamType);
    return api.get(`/api/webinars/admin?${params.toString()}`);
  },

  getWebinarById: (webinarId: string, fields: 'basic' | 'detailed' | 'full' = 'full') =>
    api.get(`/api/webinars/admin/${webinarId}?fields=${fields}`),

  createWebinar: (webinarData: any) => api.post('/api/webinars/admin', webinarData),

  updateWebinar: (webinarId: string, webinarData: any) => api.put(`/api/webinars/admin/${webinarId}`, webinarData),

  deleteWebinar: (webinarId: string) => api.delete(`/api/webinars/admin/${webinarId}`),

  getWebinarAttendees: (webinarId: string) => api.get(`/api/webinars/admin/${webinarId}/attendees`),

  markUserAsAttended: (webinarId: string, userId: string) =>
    api.post(`/api/webinars/admin/${webinarId}/user/${userId}/attend`),

  markUserAsMissed: (webinarId: string, userId: string) =>
    api.post(`/api/webinars/admin/${webinarId}/user/${userId}/missed`),

  // Public/User functions
  getPublicWebinars: (fields: 'basic' | 'detailed' | 'full' = 'basic', filters?: { status?: string; streamType?: string }) => {
    const params = new URLSearchParams();
    params.append('fields', fields);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.streamType) params.append('streamType', filters.streamType);
    return api.get(`/api/webinars/public?${params.toString()}`);
  },

  getPublicWebinarById: (webinarId: string) => api.get(`/api/webinars/public/${webinarId}`),

  registerForWebinar: (webinarId: string) => api.post(`/api/webinars/${webinarId}/register`),

  unregisterFromWebinar: (webinarId: string) => api.delete(`/api/webinars/${webinarId}/unregister`),

  markAsAttended: (webinarId: string) => api.post(`/api/webinars/${webinarId}/attend`),
};