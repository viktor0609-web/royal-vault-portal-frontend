// Orders API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";

export interface Order {
  id: string;
  dealId: string;
  name: string;
  amount: string;
  status: string;
  dealStage: string;
  closeDate?: string;
  createDate?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  paymentId: string;
  paymentNumber: string;
  amount: string;
  status: string;
  createDate?: string;
  last4: string;
  dealIds: string[];
}

export interface Subscription {
  id: string;
  subscriptionId: string;
  name: string;
  status: string;
  last4: string;
  amount: string;
  nextBillingDate?: string;
}

export const ordersService = {
  // Get user's orders (deals)
  getOrders: () =>
    api.get<{ message: string; orders: Order[] }>(API_ENDPOINTS.ORDERS.BASE),

  // Get orders for a specific user (Admin only)
  getAdminUserOrders: (userId: string) =>
    api.get<{ message: string; orders: Order[] }>(`${API_ENDPOINTS.ORDERS.BASE}/admin/${userId}`),

  // Get payments (optionally filtered by dealId)
  getPayments: (dealId?: string) => {
    const params = new URLSearchParams();
    if (dealId) params.append("dealId", dealId);
    return api.get<{ message: string; payments: Payment[] }>(
      `${API_ENDPOINTS.ORDERS.PAYMENTS}${params.toString() ? `?${params.toString()}` : ""}`
    );
  },

  // Get subscriptions
  getSubscriptions: () =>
    api.get<{ message: string; subscriptions: Subscription[] }>(
      API_ENDPOINTS.ORDERS.SUBSCRIPTIONS
    ),

  // Get subscriptions for a specific user (Admin only)
  getAdminUserSubscriptions: (userId: string) =>
    api.get<{ message: string; subscriptions: Subscription[] }>(
      `${API_ENDPOINTS.ORDERS.BASE}/admin/${userId}/subscriptions`
    ),
};

