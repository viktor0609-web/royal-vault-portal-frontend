// Deal API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { Deal, FieldSelection } from "@/types";

export const dealService = {
  // Get all deals with field selection
  getAllDeals: (
    fields: FieldSelection = "basic",
    publicOnly: boolean = false
  ) => {
    const params = new URLSearchParams();
    params.append("fields", fields);
    if (publicOnly) params.append("publicOnly", "true");
    return api.get<{ message: string; deals: Deal[] }>(`${API_ENDPOINTS.DEALS.BASE}?${params.toString()}`);
  },

  // Get deal by ID with field selection
  getDealById: (dealId: string, fields: FieldSelection = "full") =>
    api.get<{ data: Deal }>(`${API_ENDPOINTS.DEALS.BASE}/${dealId}?fields=${fields}`),

  // Create new deal
  createDeal: (dealData: Partial<Deal>) =>
    api.post<{ data: Deal }>(API_ENDPOINTS.DEALS.BASE, dealData),

  // Update deal
  updateDeal: (dealId: string, dealData: Partial<Deal>) =>
    api.put<{ data: Deal }>(`${API_ENDPOINTS.DEALS.BASE}/${dealId}`, dealData),

  // Delete deal
  deleteDeal: (dealId: string) =>
    api.delete(`${API_ENDPOINTS.DEALS.BASE}/${dealId}`),

  // Filter deals with field selection
  filterDeals: (
    filters: any,
    fields: FieldSelection = "basic",
    publicOnly: boolean = false
  ) => {
    const params = { ...filters, fields };
    if (publicOnly) params.publicOnly = "true";
    return api.get<{ message: string; deals: Deal[] }>(API_ENDPOINTS.DEALS.FILTER, { params });
  },

  // Get user's starred deals
  getStarredDeals: (fields: FieldSelection = "basic") => {
    const params = new URLSearchParams();
    params.append("fields", fields);
    return api.get<{ message: string; deals: Deal[] }>(`${API_ENDPOINTS.DEALS.STARRED}?${params.toString()}`);
  },

  // Star a deal
  starDeal: (dealId: string) =>
    api.post<{ message: string; data: Deal }>(`${API_ENDPOINTS.DEALS.STAR}/${dealId}`),

  // Unstar a deal
  unstarDeal: (dealId: string) =>
    api.delete<{ message: string }>(`${API_ENDPOINTS.DEALS.STAR}/${dealId}`),
};

