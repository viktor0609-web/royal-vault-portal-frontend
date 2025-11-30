// Course API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { CourseGroup, Course, Lecture, FieldSelection } from "@/types";

export const courseService = {
  // Course Groups with field selection, pagination, and filtering
  getAllCourseGroups: (
    filters?: {
      type?: string;
      search?: string;
      page?: number;
      limit?: number;
      publicOnly?: boolean;
    },
    fields: FieldSelection = "basic"
  ) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.publicOnly) params.append("publicOnly", "true");
    params.append("fields", fields);
    return api.get<{ data: CourseGroup[] }>(`${API_ENDPOINTS.COURSES.GROUPS}?${params.toString()}`);
  },

  createCourseGroup: (groupData: Partial<CourseGroup>) =>
    api.post<{ data: CourseGroup }>(API_ENDPOINTS.COURSES.GROUPS, groupData),

  getCourseGroupById: (
    groupId: string,
    fields: FieldSelection = "full",
    publicOnly: boolean = true
  ) => {
    const params = new URLSearchParams();
    params.append("fields", fields);
    if (publicOnly) params.append("publicOnly", "true");
    return api.get<{ data: CourseGroup }>(`${API_ENDPOINTS.COURSES.GROUPS}/${groupId}?${params.toString()}`);
  },

  updateCourseGroup: (groupId: string, groupData: Partial<CourseGroup>) =>
    api.put<{ data: CourseGroup }>(`${API_ENDPOINTS.COURSES.GROUPS}/${groupId}`, groupData),

  deleteCourseGroup: (groupId: string) =>
    api.delete(`${API_ENDPOINTS.COURSES.GROUPS}/${groupId}`),

  // Courses with field selection, pagination, and filtering
  getAllCourses: (options?: {
    fields?: FieldSelection;
    page?: number;
    limit?: number;
    publicOnly?: boolean;
    courseGroup?: string;
  }) => {
    const params = new URLSearchParams();
    const fields = options?.fields || "basic";
    params.append("fields", fields);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.publicOnly) params.append("publicOnly", "true");
    if (options?.courseGroup) params.append("courseGroup", options.courseGroup);
    return api.get<{ data: Course[] }>(`${API_ENDPOINTS.COURSES.COURSES}?${params.toString()}`);
  },

  createCourse: (courseData: Partial<Course>, courseGroupId: string) =>
    api.post<{ data: Course }>(`${API_ENDPOINTS.COURSES.COURSES}/${courseGroupId}`, courseData),

  getCourseById: (
    courseId: string,
    fields: FieldSelection = "full",
    publicOnly: boolean = true
  ) => {
    const params = new URLSearchParams();
    params.append("fields", fields);
    if (publicOnly) params.append("publicOnly", "true");
    return api.get<{ data: Course }>(`${API_ENDPOINTS.COURSES.COURSES}/${courseId}?${params.toString()}`);
  },

  updateCourse: (courseId: string, courseData: Partial<Course>) =>
    api.put<{ data: Course }>(`${API_ENDPOINTS.COURSES.COURSES}/${courseId}`, courseData),

  deleteCourse: (courseId: string) =>
    api.delete(`${API_ENDPOINTS.COURSES.COURSES}/${courseId}`),

  // Lectures with pagination and filtering
  getAllLectures: (options?: {
    page?: number;
    limit?: number;
    publicOnly?: boolean;
    courseId?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.publicOnly) params.append("publicOnly", "true");
    if (options?.courseId) params.append("courseId", options.courseId);
    return api.get<{ data: Lecture[] }>(`${API_ENDPOINTS.COURSES.LECTURES}?${params.toString()}`);
  },

  createLecture: (lectureData: Partial<Lecture>) =>
    api.post<{ data: Lecture }>(API_ENDPOINTS.COURSES.LECTURES, lectureData),

  getLectureById: (lectureId: string) =>
    api.get<{ data: Lecture }>(`${API_ENDPOINTS.COURSES.LECTURES}/${lectureId}`),

  updateLecture: (lectureId: string, lectureData: Partial<Lecture>) =>
    api.put<{ data: Lecture }>(`${API_ENDPOINTS.COURSES.LECTURES}/${lectureId}`, lectureData),

  deleteLecture: (lectureId: string) =>
    api.delete(`${API_ENDPOINTS.COURSES.LECTURES}/${lectureId}`),

  completeLecture: (lectureId: string) =>
    api.post(`${API_ENDPOINTS.COURSES.LECTURES}/${lectureId}/complete`),

  // Save YouTube video URL to lecture
  saveYouTubeVideo: (
    lectureId: string,
    videoData: {
      youtubeUrl: string;
      title?: string;
      description?: string;
      videoId?: string;
    }
  ) => api.post(`${API_ENDPOINTS.COURSES.LECTURES}/${lectureId}/youtube`, videoData),
};

