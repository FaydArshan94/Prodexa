"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/redux/actions/authActions";
import { clearError } from "@/lib/redux/slices/authSlice";
import { loginSchema } from "@/lib/validations/authValidation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  ShoppingBag,
  Store,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { cartSocketService } from "@/lib/services/cartSocketService";
import { aiSocketService } from "@/lib/services/aiSocket";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux state
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  // Update role when userType changes
  // useEffect(() => {
  //   setValue("role", userType);
  // }, [userType, setValue]);

  const onSubmit = async (data) => {
    dispatch(clearError());

    try {
      const result = await dispatch(login(data)).unwrap();

      const token = result?.token;

      // console.log(token);

      if (token) {
        localStorage.setItem("token", token);
      }

      // Initialize socket services after successful login
      cartSocketService.initialize(token);
      aiSocketService.initialize(token);

      // Redirect based on role
      if (result.user?.role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Show error message to user through UI
      const errorMessage =
        err.message ||
        "Login failed. Please check your credentials and try again.";
      dispatch({
        type: "auth/loginFailure",
        payload: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-slate-600">Login to continue shopping</p>
          </div>

          <Card className="p-8 shadow-xl">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* User Type Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setUserType("user")}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  userType === "user"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => setUserType("seller")}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  userType === "seller"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store className="h-5 w-5" />
                Seller
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  `Login as ${userType === "user" ? "User" : "Seller"}`
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                <span className="text-xl">G</span>
                Google
              </Button>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                <span className="text-xl">f</span>
                Facebook
              </Button>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Register Now
                </Link>
              </p>
            </div>
          </Card>

          {/* Info Banner */}
          {userType === "seller" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                🎉 New to selling?{" "}
                <Link href="/register" className="font-semibold underline">
                  Start selling today!
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
