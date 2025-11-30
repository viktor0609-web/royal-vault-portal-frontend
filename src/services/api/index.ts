// Centralized API services export
export { api, setOnTokensCleared } from "./client";
export { authService } from "./auth.service";
export { dealService } from "./deal.service";
export { courseService } from "./course.service";
export { webinarService } from "./webinar.service";
export { userService } from "./user.service";
export { optionsService } from "./options.service";
export { uploadService } from "./upload.service";

// Import services for legacy exports
import { dealService } from "./deal.service";
import { courseService } from "./course.service";
import { webinarService } from "./webinar.service";
import { userService } from "./user.service";
import { optionsService } from "./options.service";
import { uploadService } from "./upload.service";

// Legacy exports for backward compatibility
export const dealApi = {
  getAllDeals: dealService.getAllDeals,
  getDealById: dealService.getDealById,
  createDeal: dealService.createDeal,
  updateDeal: dealService.updateDeal,
  deleteDeal: dealService.deleteDeal,
  filterDeals: dealService.filterDeals,
};

export const courseApi = {
  getAllCourseGroups: courseService.getAllCourseGroups,
  createCourseGroup: courseService.createCourseGroup,
  getCourseGroupById: courseService.getCourseGroupById,
  updateCourseGroup: courseService.updateCourseGroup,
  deleteCourseGroup: courseService.deleteCourseGroup,
  getAllCourses: courseService.getAllCourses,
  createCourse: courseService.createCourse,
  getCourseById: courseService.getCourseById,
  updateCourse: courseService.updateCourse,
  deleteCourse: courseService.deleteCourse,
  getAllLectures: courseService.getAllLectures,
  createLecture: courseService.createLecture,
  getLectureById: courseService.getLectureById,
  updateLecture: courseService.updateLecture,
  deleteLecture: courseService.deleteLecture,
  completeLecture: courseService.completeLecture,
  uploadImage: uploadService.uploadImage,
  uploadFile: uploadService.uploadFile,
  saveYouTubeVideo: courseService.saveYouTubeVideo,
};

export const webinarApi = {
  getAllWebinars: webinarService.getAllWebinars,
  getWebinarById: webinarService.getWebinarById,
  createWebinar: webinarService.createWebinar,
  updateWebinar: webinarService.updateWebinar,
  deleteWebinar: webinarService.deleteWebinar,
  getWebinarAttendees: webinarService.getWebinarAttendees,
  markUserAsAttended: webinarService.markUserAsAttended,
  markUserAsMissed: webinarService.markUserAsMissed,
  endWebinar: webinarService.endWebinar,
  getDownloadLink: webinarService.getDownloadLink,
  setWebinarOnRecording: webinarService.setWebinarOnRecording,
  getPublicWebinars: webinarService.getPublicWebinars,
  getPublicWebinarById: webinarService.getPublicWebinarById,
  getPublicWebinarBySlug: webinarService.getPublicWebinarBySlug,
  registerForWebinar: webinarService.registerForWebinar,
  isValidEmailAddress: webinarService.isValidEmailAddress,
  unregisterFromWebinar: webinarService.unregisterFromWebinar,
  markAsAttended: webinarService.markAsAttended,
  saveChatMessage: webinarService.saveChatMessage,
  getChatMessages: webinarService.getChatMessages,
  clearChatMessages: webinarService.clearChatMessages,
};

export const userApi = {
  getAllUsers: userService.getAllUsers,
  getUserById: userService.getUserById,
  createUser: userService.createUser,
  updateUser: userService.updateUser,
  deleteUser: userService.deleteUser,
  resetUserPassword: userService.resetUserPassword,
  toggleUserVerification: userService.toggleUserVerification,
  changeUserRole: userService.changeUserRole,
  getUserStatistics: userService.getUserStatistics,
  bulkUpdateUsers: userService.bulkUpdateUsers,
  bulkDeleteUsers: userService.bulkDeleteUsers,
};

export const optionsApi = {
  getCategories: optionsService.getCategories,
  getSubCategories: optionsService.getSubCategories,
  getTypes: optionsService.getTypes,
  getStrategies: optionsService.getStrategies,
  getRequirements: optionsService.getRequirements,
  getSources: optionsService.getSources,
};

export const imageApi = {
  uploadImage: uploadService.uploadImage,
  getSignedUploadUrl: uploadService.getSignedImageUploadUrl,
};

export const fileApi = {
  uploadFile: uploadService.uploadFile,
  getSignedUploadUrl: uploadService.getSignedFileUploadUrl,
};

