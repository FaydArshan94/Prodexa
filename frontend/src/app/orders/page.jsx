"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/lib/api/axiosConifg";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.get("/me");
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodBadge = (paymentMethod) => {
    if (!paymentMethod) return null;

    if (paymentMethod.type === "COD") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Cash on Delivery
        </Badge>
      );
    }

    if (paymentMethod.type === "RAZORPAY") {
      const method = paymentMethod.details?.method;
      let badgeText = "Razorpay";
      let extraInfo = "";

      if (method === "card") {
        badgeText = "Card";
        extraInfo = paymentMethod.details.last4 ? ` (*${paymentMethod.details.last4})` : "";
      } else if (method === "upi") {
        badgeText = "UPI";
      } else if (method === "netbanking") {
        badgeText = "Net Banking";
        extraInfo = paymentMethod.details.bank ? ` (${paymentMethod.details.bank})` : "";
      }

      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {badgeText}{extraInfo}
        </Badge>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      Order #{order._id.slice(-8)}
                    </h3>
                    {getPaymentMethodBadge(order.paymentMethod)}
                  </div>
                  <p className="text-sm text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    ₹{order.totalPrice.amount.toLocaleString()}
                  </p>
                  <Badge
                    className={`mt-1 ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded">
                        <img 
                          src={item.product.image.url} 
                          alt={item.product.title} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.product.title}</p>
                        <p className="text-sm text-slate-500">
                          Qty: {item.quantity} × ₹{item.price.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <Link 
                  href={`/orders/${order._id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Order Details →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}