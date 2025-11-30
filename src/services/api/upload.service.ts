// Upload API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";

export const uploadService = {
  // Image upload (legacy - through backend)
  uploadImage: (formData: FormData) =>
    api.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get signed upload URL for direct upload
  getSignedImageUploadUrl: (filename: string, contentType: string) =>
    api.post(API_ENDPOINTS.UPLOAD.IMAGE_SIGNED_URL, { filename, contentType }),

  // File upload (for all file types)
  uploadFile: (formData: FormData, config?: any) =>
    api.post(API_ENDPOINTS.UPLOAD.FILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    }),

  // Get signed upload URL for direct file upload
  getSignedFileUploadUrl: (filename: string, contentType: string) =>
    api.post(API_ENDPOINTS.UPLOAD.FILE_SIGNED_URL, { filename, contentType }),
};

