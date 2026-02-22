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
  getStarredDeals: dealService.getStarredDeals,
  starDeal: dealService.starDeal,
  unstarDeal: dealService.unstarDeal,
};

export const courseApi = {
  getAllCourseGroups: courseService.getAllCourseGroups,
  createCourseGroup: courseService.createCourseGroup,
  getCourseGroupById: courseService.getCourseGroupById,
  updateCourseGroup: courseService.updateCourseGroup,
  reorderCourseGroups: courseService.reorderCourseGroups,
  reorderCoursesInGroup: courseService.reorderCoursesInGroup,
  deleteCourseGroup: courseService.deleteCourseGroup,
  getAllCourses: courseService.getAllCourses,
  createCourse: courseService.createCourse,
  getCourseById: courseService.getCourseById,
  updateCourse: courseService.updateCourse,
  moveCourseToGroup: courseService.moveCourseToGroup,
  reorderLecturesInCourse: courseService.reorderLecturesInCourse,
  deleteCourse: courseService.deleteCourse,
  getAllLectures: courseService.getAllLectures,
  createLecture: courseService.createLecture,
  getLectureById: courseService.getLectureById,
  updateLecture: courseService.updateLecture,
  deleteLecture: courseService.deleteLecture,
  moveLectureToCourse: courseService.moveLectureToCourse,
  completeLecture: courseService.completeLecture,
  uploadImage: uploadService.uploadImage,
  uploadFile: uploadService.uploadFile,
  saveYouTubeVideo: courseService.saveYouTubeVideo,
  getAllCategories: courseService.getAllCategories,
  createCategory: courseService.createCategory,
  updateCategory: courseService.updateCategory,
  deleteCategory: courseService.deleteCategory,
  reorderCategories: courseService.reorderCategories,
};

export const webinarApi = {
  getAllWebinars: webinarService.getAllWebinars,
  getWebinarById: webinarService.getWebinarById,
  createWebinar: webinarService.createWebinar,
  updateWebinar: webinarService.updateWebinar,
  deleteWebinar: webinarService.deleteWebinar,
  getWebinarAttendees: webinarService.getWebinarAttendees,
  syncAttendeesToHubSpot: webinarService.syncAttendeesToHubSpot,
  markUserAsAttended: webinarService.markUserAsAttended,
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
  markAsWatched: webinarService.markAsWatched,
  saveChatMessage: webinarService.saveChatMessage,
  getChatMessages: webinarService.getChatMessages,
  clearChatMessages: webinarService.clearChatMessages,
  getPinnedMessages: webinarService.getPinnedMessages,
  pinMessage: webinarService.pinMessage,
  unpinMessage: webinarService.unpinMessage,
  getActiveCtas: webinarService.getActiveCtas,
  activateCta: webinarService.activateCta,
  deactivateCta: webinarService.deactivateCta,
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
  getViewAsUserUrl: userService.getViewAsUserUrl,
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

