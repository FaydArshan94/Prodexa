"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { orderApi } from "@/lib/api/axiosConifg";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Package,
  MapPin,
  CreditCard,
  Clock,
} from "lucide-react";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderApi.get(`/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-slate-900 font-medium mb-2">Oops! Something went wrong</p>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <p className="text-slate-900 font-medium mb-6">Order not found</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
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
        {/* Order Success Banner */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Order Successfully Placed!
          </h1>
          <p className="text-slate-600 mb-4">
            Thank you for your order. We'll send you shipping updates via email.
          </p>
          <div className="text-lg font-semibold text-slate-900">
            Order ID: #{order._id}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Order Status
              </h2>
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                <div className="text-sm text-slate-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 py-4 border-b last:border-0"
                  >
                    <Link href={`/products/${item.product._id}`} className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={item.product.image?.url}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {item.product.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900">
                        {/* ₹{item.priceAtOrder} */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Shipping Address
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-slate-900">{order.shippingAddress.street}</p>
                  <p className="text-slate-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="text-slate-600">
                    {order.shippingAddress.country} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Payment Information
              </h2>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-slate-900">
                    Payment Method:{" "}
                    <span className="font-medium">
                      {order.paymentMethod?.type === "RAZORPAY"
                        ? "Online Payment"
                        : "Cash on Delivery"}
                    </span>
                  </p>
                  {order.payment && (
                    <p className="text-slate-600">
                      Payment ID: {order.payment.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                    <span>₹{order.totalPrice.amount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>₹{order?.shippingCharges}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    {/* <span>-₹{order.discount}</span> */}
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Total</span>
                    <span>₹{order.totalPrice.amount}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/orders">
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}