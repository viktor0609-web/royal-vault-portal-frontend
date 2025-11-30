// Options API service for dropdowns
import api from "./client";
import { API_ENDPOINTS } from "@/constants";

export interface Option {
  _id: string;
  name: string;
  [key: string]: any;
}

export const optionsService = {
  // Get all categories
  getCategories: () => api.get<{ data: Option[] }>(API_ENDPOINTS.OPTIONS.CATEGORIES),

  // Get all subcategories
  getSubCategories: () => api.get<{ data: Option[] }>(API_ENDPOINTS.OPTIONS.SUB_CATEGORIES),

  // Get all types
  getTypes: () => api.get<{ data: Option[] }>(API_ENDPOINTS.OPTIONS.TYPES),

  // Get all strategies
  getStrategies: () => api.get<{ data: Option[] }>(API_ENDPOINTS.OPTIONS.STRATEGIES),

  // Get all requirements
  getRequirements: () => api.get<{ data: Option[] }>(API_ENDPOINTS.OPTIONS.REQUIREMENTS),

  // Get all sources
  getSources: () => api.get<{ data: Option[] }>(API_ENDPOINTS.OPTIONS.SOURCES),
};

