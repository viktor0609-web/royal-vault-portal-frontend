// Webinar API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { Webinar, FieldSelection } from "@/types";

export const webinarService = {
  // Admin functions
  getAllWebinars: (
    fields: FieldSelection = "basic",
    filters?: {
      status?: string;
      streamType?: string;
      orderBy?: string;
      order?: "asc" | "desc";
    }
  ) => {
    const params = new URLSearchParams();
    params.append("fields", fields);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.streamType) params.append("streamType", filters.streamType);
    if (filters?.orderBy) params.append("orderBy", filters.orderBy);
    if (filters?.order) params.append("order", filters.order);
    return api.get<{ message: string; webinars: Webinar[] }>(`${API_ENDPOINTS.WEBINARS.ADMIN}?${params.toString()}`);
  },

  getWebinarById: (webinarId: string, fields: FieldSelection = "full") =>
    api.get<{ message: string; webinar: Webinar }>(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}?fields=${fields}`),

  createWebinar: (webinarData: Partial<Webinar>) =>
    api.post<{ message: string; webinar: Webinar }>(API_ENDPOINTS.WEBINARS.ADMIN, webinarData),

  updateWebinar: (webinarId: string, webinarData: Partial<Webinar>) =>
    api.put<{ message: string; webinar: Webinar }>(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}`, webinarData),

  deleteWebinar: (webinarId: string) =>
    api.delete(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}`),

  getWebinarAttendees: (webinarId: string) =>
    api.get(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}/attendees`),

  markUserAsAttended: (webinarId: string, userId: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}/user/${userId}/attend`),

  markUserAsMissed: (webinarId: string, userId: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}/user/${userId}/missed`),

  endWebinar: (webinarId: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.ADMIN}/${webinarId}/end`),

  getDownloadLink: (rawRecordingId: string) =>
    api.get(`${API_ENDPOINTS.WEBINARS.ADMIN}/${rawRecordingId}/download-link`),

  setWebinarOnRecording: (slug: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.ADMIN}/${slug}/on-recording`),

  // Public/User functions
  getPublicWebinars: (
    fields: FieldSelection = "basic",
    filters?: { status?: string; streamType?: string }
  ) => {
    const params = new URLSearchParams();
    params.append("fields", fields);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.streamType) params.append("streamType", filters.streamType);
    return api.get<{ message: string; webinars: Webinar[] }>(`${API_ENDPOINTS.WEBINARS.PUBLIC}?${params.toString()}`);
  },

  getPublicWebinarById: (webinarId: string) =>
    api.get<{ message: string; webinar: Webinar }>(`${API_ENDPOINTS.WEBINARS.PUBLIC}/${webinarId}`),

  getPublicWebinarBySlug: (slug: string) =>
    api.get<{ message: string; webinar: Webinar }>(`${API_ENDPOINTS.WEBINARS.PUBLIC}/${slug}`),

  registerForWebinar: (webinarId: string, email: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.REGISTER}/${webinarId}/register`, { email }),

  isValidEmailAddress: (email: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.REGISTER}/isValidEmailAddress`, { email }),

  unregisterFromWebinar: (webinarId: string) =>
    api.delete(`${API_ENDPOINTS.WEBINARS.REGISTER}/${webinarId}/unregister`),

  markAsAttended: (webinarId: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.REGISTER}/${webinarId}/attend`),

  // Chat functions
  saveChatMessage: (
    webinarId: string,
    messageData: { senderUserId: string; senderName: string; text: string }
  ) => api.post(`${API_ENDPOINTS.WEBINARS.CHAT}/${webinarId}/chat`, messageData),

  getChatMessages: (webinarId: string) =>
    api.get(`${API_ENDPOINTS.WEBINARS.CHAT}/${webinarId}/chat`),

  clearChatMessages: (webinarId: string) =>
    api.delete(`${API_ENDPOINTS.WEBINARS.CHAT}/${webinarId}/chat`),

  // Pinned messages functions
  getPinnedMessages: (webinarId: string) =>
    api.get(`${API_ENDPOINTS.WEBINARS.CHAT}/${webinarId}/chat/pinned`),

  pinMessage: (webinarId: string, messageId: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.CHAT}/${webinarId}/chat/${messageId}/pin`),

  unpinMessage: (webinarId: string, messageId: string) =>
    api.post(`${API_ENDPOINTS.WEBINARS.CHAT}/${webinarId}/chat/${messageId}/unpin`),
};

