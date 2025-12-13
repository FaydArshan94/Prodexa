"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orderApi, API_URLS } from "@/lib/api/axiosConifg";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, fetchCart } from "@/lib/redux/actions/cartActions";

// Mock cart items
const cartItems = [
  // { id: 1, name: 'Wireless Headphones', price: 2999, image: '🎧', quantity: 1 },
  // { id: 2, name: 'Smart Watch Pro', price: 5999, image: '⌚', quantity: 2 },
];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Payment
  const [selectedPayment, setSelectedPayment] = useState("");
  const [formData, setFormData] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { cart = [], isLoading, totals } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Form validation with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },
  });

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item?.priceAtAdd * item?.quantity,
    0
  );

  const deliveryCharges = 0;
  const total = subtotal + deliveryCharges;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const initializeRazorpayPayment = async (orderId) => {
    let paymentSuccessful = false;

    try {
      // console.log('🔄 Creating payment for order:', orderId);

      // Use the API function with proper token handling
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URLS.payment}/create/${orderId}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log('✅ Payment created:', response.data);

      const { payment } = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payment.price.amount, // Amount is already in paise from backend
        currency: payment.price.currency,
        name: "Prodexa",
        description: "Order payment",
        order_id: payment.razorpayOrderId,

        handler: async (response) => {
          paymentSuccessful = true;
          // console.log("💳 Payment successful, verifying...", response);

          try {
            // console.log("🔐 Starting verification...");

            const verifyResponse = await axios.post(
              `${API_URLS.payment}/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentDetails: {
                  method: response.payment?.method,
                  bank: response.payment?.bank,
                  last4: response.payment?.card?.last4 || null,
                },
              },
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            // console.log("✅ Payment verified successfully", verifyResponse.data);

            // Clear cart
            // console.log("🗑️ Clearing cart...");
            dispatch(clearCart());

            // console.log("🎉 Redirecting to order page...");

            // Redirect
            setTimeout(() => {
              router.push(`/orders/${orderId}`);
            }, 500);
          } catch (error) {
            console.error("❌ Payment verification failed:", error);
            console.error(
              "Error details:",
              error.response?.data || error.message
            );

            alert(
              "Payment successful but verification pending. Check your order status."
            );
            setTimeout(() => {
              router.push(`/orders/${orderId}`);
            }, 500);
          }
        },

        modal: {
          ondismiss: function () {
            // console.log("Payment modal was closed");

            if (!paymentSuccessful) {
              // console.log("Payment was cancelled or failed");
              alert(
                "Payment cancelled. Your order is created but payment is pending."
              );
              setIsPlacingOrder(false);
              router.push(`/orders/${orderId}`);
            }
          },
        },

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("❌ Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsPlacingOrder(false);
      });

      rzp.open();
    } catch (error) {
      console.error("❌ Failed to initialize payment:", error);
      console.error("Error response:", error.response?.data);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        router.push("/login");
      } else {
        alert("Failed to initialize payment. Please try again.");
      }

      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    setIsPlacingOrder(true);
    try {
      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: "India",
      };

      // Create order first
      const paymentMethodData = {
        type: selectedPayment.toUpperCase(),
        details: null, // Will be updated after Razorpay payment
      };

      const response = await orderApi.post("/", {
        shippingAddress,
        paymentMethod: paymentMethodData,
      });

      const orderId = response.data.order._id;

      if (selectedPayment === "razorpay") {
        await initializeRazorpayPayment(orderId);
      } else if (selectedPayment === "cod") {
        // For COD, simply redirect to success page
        dispatch(clearCart());
        router.push(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      // TODO: Add error toast
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { number: 1, name: "Cart", completed: true },
    { number: 2, name: "Address", completed: currentStep > 1 },
    { number: 3, name: "Payment", completed: false },
  ];

  const onSubmit = async (data) => {
    setFormData(data);
    // Move to the next step
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-slate-900">
              Cart
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-1 sm:gap-4 max-w-2xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-1 sm:gap-3 flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-base ${
                      step.completed || currentStep >= step.number
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`font-medium text-xs sm:text-base ${
                      currentStep >= step.number
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      step.completed ? "bg-green-600" : "bg-slate-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Step 1: Delivery Address */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${
                    currentStep >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > 1 ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    "1"
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Delivery Address
                </h2>
              </div>

              {currentStep === 1 ? (
                <form
                  onSubmit={handleSubmit((data) => {
                    onSubmit(data);
                    setCurrentStep(2);
                  })}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Name */}

                    {/* <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                        Full Name *
                      </label>
                      <Input
                        {...register("fullName", {
                          required: "Full name is required",
                          minLength: {
                            value: 3,
                            message: "Name must be at least 3 characters",
                          },
                        })}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div> */}

                    {/* Mobile Number */}

                    {/* <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mobile Number *
                      </label>
                      <Input
                        type="tel"
                        {...register("mobile", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Please enter a valid 10-digit mobile number",
                          },
                        })}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.mobile.message}
                        </p>
                      )}
                    </div> */}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                      Address (House No, Building, Street, Area) *
                    </label>
                    <textarea
                      {...register("street", {
                        required: "Street is required",
                        minLength: {
                          value: 10,
                          message: "Street must be at least 10 characters",
                        },
                      })}
                      placeholder="Enter your complete address"
                      rows={3}
                      className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                        City/District *
                      </label>
                      <Input
                        {...register("city", {
                          required: "City is required",
                        })}
                        placeholder="City/District"
                        className="text-sm"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                        State *
                      </label>
                      <select
                        {...register("state", {
                          required: "Please select a state",
                        })}
                        className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select State</option>
                        <option value="UP">Uttar Pradesh</option>
                        <option value="MH">Maharashtra</option>
                        <option value="DL">Delhi</option>
                        <option value="KA">Karnataka</option>
                        <option value="TN">Tamil Nadu</option>
                        <option value="WB">West Bengal</option>
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                        Pincode *
                      </label>
                      <Input
                        {...register("pincode", {
                          required: "Pincode is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Please enter a valid 6-digit pincode",
                          },
                        })}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        className="text-sm"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                        Country *
                      </label>
                      <select
                        {...register("country", {
                          required: "Please select a country",
                        })}
                        className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">Select Country</option>
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    Continue to Payment
                  </Button>
                </form>
              ) : (
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-600 text-xs sm:text-sm mt-1 break-words">
                        {formData?.street}
                      </p>
                      <p className="text-slate-600 text-xs sm:text-sm break-words">
                        {formData?.city}
                      </p>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        {formData?.state} - {formData?.pincode}
                      </p>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        {formData?.country}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Step 2: Payment Method */}
            {currentStep >= 2 && (
              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white text-sm sm:text-base">
                    2
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Razorpay */}
                  <label className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={selectedPayment === "razorpay"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    />
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-xs sm:text-base">
                        Pay Online (Razorpay)
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500">
                        Cards, UPI, Netbanking & More
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <img src="/visa.png" alt="Visa" className="h-5 sm:h-6" />
                      <img
                        src="/mastercard.png"
                        alt="Mastercard"
                        className="h-5 sm:h-6"
                      />
                      <img
                        src="/rupay.png"
                        alt="RuPay"
                        className="h-5 sm:h-6"
                      />
                    </div>
                  </label>

                  {/* COD */}
                  <label className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === "cod"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    />
                    <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-xs sm:text-base">
                        Cash on Delivery
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500">
                        Pay when you receive
                      </div>
                    </div>
                  </label>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-4 sm:mt-6 bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Placing Order...</span>
                      <span className="sm:hidden">Placing...</span>
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </Card>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6 sticky top-4 sm:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                Order Summary
              </h2>

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-slate-600">Loading products...</p>
                </div>
              )}

              {/* Products */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {cart.map((item) => (
                  <div key={item?.productId} className="flex gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                      <img src={item?.productSnapshot.image} alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm line-clamp-2">
                        {item?.productSnapshot.title}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Qty: {item?.quantity}
                      </p>
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                        ₹{item?.productSnapshot.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 sm:space-y-3 border-t pt-3 sm:pt-4">
                <div className="flex justify-between text-slate-600 text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-xs sm:text-sm">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="border-t pt-2 sm:pt-3 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Safe Checkout */}
              <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs sm:text-sm text-green-700 font-semibold">
                  🔒 Safe and Secure Payment
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
