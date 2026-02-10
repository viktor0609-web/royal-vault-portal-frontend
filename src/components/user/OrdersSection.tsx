import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/Loading";
import { Receipt, CreditCard, Calendar, CheckCircle2, XCircle, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersService, type Order, type Payment, type Subscription } from "@/services/api/orders.service";

interface OrdersSectionProps {
  viewAsUserId?: string; // Optional prop for admin viewing as user
  viewAsUserName?: string; // Optional prop for displaying the user's name
}

export function OrdersSection({ viewAsUserId, viewAsUserName }: OrdersSectionProps = {} as OrdersSectionProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdminView = !!viewAsUserId;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user && !viewAsUserId) return;

      try {
        setLoading(true);
        setError(null);

        let ordersResponse, subscriptionsResponse;

        if (viewAsUserId) {
          // Admin viewing as user
          [ordersResponse, subscriptionsResponse] = await Promise.all([
            ordersService.getAdminUserOrders(viewAsUserId),
            ordersService.getAdminUserSubscriptions(viewAsUserId),
          ]);
        } else {
          // Regular user view
          [ordersResponse, subscriptionsResponse] = await Promise.all([
            ordersService.getOrders(),
            ordersService.getSubscriptions(),
          ]);
        }

        setOrders(ordersResponse.data.orders || []);
        setSubscriptions(subscriptionsResponse.data.subscriptions || []);
      } catch (err: any) {
        console.error("Error fetching orders data:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, viewAsUserId]);

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Format currency
  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "paid" || lowerStatus === "active") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    } else if (lowerStatus === "refunded" || lowerStatus === "canceled") {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          <XCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-2 sm:p-4">
        <Loading message="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full p-2 sm:p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full animate-in fade-in duration-100 ${!isAdminView ? "p-2 sm:p-4" : ""}`}>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Main Body - Orders */}
        <div className="flex-1 min-w-0">
          {!isAdminView && (
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-royal-dark-gray">
                Orders
              </h1>
              <p className="text-sm sm:text-base text-royal-gray mt-1">
                View your order history and payments
              </p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => {
                const orderPayments = order.payments || [];
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg sm:text-xl font-bold text-royal-dark-gray">
                            {order.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {order.status && getStatusBadge(order.status)}
                            <span className="text-sm text-royal-gray">
                              {formatCurrency(order.amount)}
                            </span>
                            <span className="text-xs text-royal-gray">
                              • {formatDate(order.createDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {orderPayments.length > 0 ? (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-royal-dark-gray mb-3">
                            Payments
                          </h3>
                          {orderPayments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <Receipt className="h-4 w-4 text-royal-gray" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-royal-dark-gray">
                                      {payment.paymentNumber}
                                    </span>
                                    {payment.status && getStatusBadge(payment.status)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-royal-gray">
                                    <span>{formatCurrency(payment.amount)}</span>
                                    {payment.last4 && (
                                      <>
                                        <span>•</span>
                                        <span>**** {payment.last4}</span>
                                      </>
                                    )}
                                    {payment.createDate && (
                                      <>
                                        <span>•</span>
                                        <span>{formatDate(payment.createDate)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-royal-gray italic">No payments found for this order</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar - Subscriptions */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-bold text-royal-dark-gray flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-6">
                    <CreditCard className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">No subscriptions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2"
                      >
                        {subscription.name && (
                          <h4 className="font-semibold text-royal-dark-gray text-sm">
                            {subscription.name}
                          </h4>
                        )}
                        <div className="flex items-center justify-between">
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-royal-gray">
                            <CreditCard className="h-3 w-3" />
                            <span>**** {subscription.last4}</span>
                          </div>
                          {subscription.amount && parseFloat(subscription.amount) > 0 && (
                            <div className="flex items-center gap-2 text-royal-gray">
                              <span>{formatCurrency(subscription.amount)}</span>
                            </div>
                          )}
                          {subscription.nextBillingDate && (
                            <div className="flex items-center gap-2 text-royal-gray">
                              <Calendar className="h-3 w-3" />
                              <span>Next billing: {formatDate(subscription.nextBillingDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

