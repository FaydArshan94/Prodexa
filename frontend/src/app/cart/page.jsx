"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeFromCart, updateQuantity } from "@/lib/redux/actions/cartActions";
import { updateQuantityOptimistic } from "@/lib/redux/slices/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();

  const { cart = [], isLoading, totals } = useSelector((state) => state.cart);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.productSnapshot?.price || 0) * item.quantity,
    0
  );

  const originalTotal = cart.reduce((sum, item) => {
    const originalPrice =
      item.productSnapshot?.originalPrice || item.productSnapshot?.price || 0;
    return sum + originalPrice * item.quantity;
  }, 0);

  const discount = originalTotal - subtotal;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryCharges = subtotal > 499 ? 0 : 50;
  const total = subtotal - couponDiscount + deliveryCharges;

  // Update quantity
  const handleUpdateQuantity = async (productId, change) => {
    const item = cart.find((item) => item.productId === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      // Optimistically update the UI
      dispatch(updateQuantityOptimistic({ productId, quantity: newQuantity }));

      try {
        // Then sync with the backend
        await dispatch(updateQuantity({ productId, quantity: newQuantity }));
      } catch (error) {
        // If the backend update fails, revert to the previous quantity
        dispatch(
          updateQuantityOptimistic({ productId, quantity: item.quantity })
        );
        console.error("Failed to update quantity:", error);
      }
    }
  };

  // Remove item
  const removeItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // Apply coupon
  const applyCoupon = () => {
    if (couponCode === "SAVE10") {
      setAppliedCoupon({ code: "SAVE10", discount: 100 });
    } else if (couponCode === "FIRST50") {
      setAppliedCoupon({ code: "FIRST50", discount: 50 });
    } else {
      alert("Invalid coupon code!");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-slate-600">Loading your cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto text-center p-12">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-slate-600 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Shopping Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item._id || item.productId} className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link href={`/products/${item.productId}`}>
                    <div className="w-24 h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0">
                      {item.productSnapshot?.image ? (
                        <img
                          src={item.productSnapshot.image}
                          alt={item.productSnapshot?.title || "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {item.productSnapshot?.title || "Product"}
                          </h3>
                        </Link>
                        {item.productSnapshot?.seller && (
                          <p className="text-sm text-slate-500 mt-1">
                            Sold by: {item.productSnapshot.seller}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {item.productSnapshot?.stock > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          In Stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-700"
                        >
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.productId, -1)
                          }
                          className="rounded-r-none h-8"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-4 font-semibold text-sm min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.productId, 1)
                          }
                          className="rounded-l-none h-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-slate-900">
                          ₹
                          {(
                            (item.productSnapshot?.price || 0) * item.quantity
                          ).toLocaleString()}
                        </div>
                        {item.productSnapshot?.discountPrice && (
                          <div className="text-sm text-slate-400 line-through">
                            ₹
                            {(
                              item.productSnapshot.discountPrice * item.quantity
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Continue Shopping Button */}
            <Link href="/products">
              <Button variant="outline" className="w-full gap-2">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Have a coupon code?
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className="flex-1"
                  />
                  <Button onClick={applyCoupon} variant="outline">
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <Tag className="h-4 w-4" />
                    <span>Coupon "{appliedCoupon.code}" applied!</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Product Discount</span>
                    <span>- ₹{discount.toLocaleString()}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>- ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  {deliveryCharges === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span>₹{deliveryCharges}</span>
                  )}
                </div>
                {deliveryCharges > 0 && subtotal < 499 && (
                  <p className="text-xs text-slate-500">
                    Add ₹{(499 - subtotal).toLocaleString()} more to get FREE
                    delivery
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              {/* Savings Info */}
              {discount + couponDiscount > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-green-700 font-semibold">
                    You're saving ₹
                    {(discount + couponDiscount).toLocaleString()} on this
                    order! 🎉
                  </p>
                </div>
              )}

              {/* Safe Checkout */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                <span>🔒</span>
                <span>Safe and secure checkout</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
