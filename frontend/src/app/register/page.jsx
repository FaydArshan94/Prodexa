"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/redux/actions/authActions";
import { clearError } from "@/lib/redux/slices/authSlice";
import { registerSchema } from "@/lib/validations/authValidation";
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

export default function RegisterPage() {
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
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: { firstName: "", lastName: "" },
      role: "user",
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
    console.log("Form data:", data);
    dispatch(clearError());

    try {
      await dispatch(registerUser(data)).unwrap();
      router.push("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      // The error handling is already done by the Redux toolkit's extraReducer
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
              Create an Account
            </h1>
            <p className="text-slate-600">
              Join us to start shopping or selling
            </p>
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

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Input
                    {...register("username")}
                    type="text"
                    placeholder="Enter your username"
                    disabled={isLoading}
                    className={errors.username ? "border-red-500" : ""}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>

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
                    placeholder="Create a password"
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

              {/* {Full Name} */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <Input
                    {...register("fullName.firstName")}
                    type="text"
                    placeholder="Enter your first name"
                    disabled={isLoading}
                    className={` ${
                      errors.fullName?.firstName ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.fullName?.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fullName.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <Input
                    {...register("fullName.lastName")}
                    type="text"
                    placeholder="Enter your last name"
                    disabled={isLoading}
                    className={` ${
                      errors.fullName?.lastName ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.fullName?.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fullName.lastName.message}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <Button
                
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  `Register as ${userType === "user" ? "Customer" : "Seller"}`
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
                  Or register with
                </span>
              </div>
            </div>

            {/* Social Registration */}
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

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Login Here
                </Link>
              </p>
            </div>
          </Card>

          {/* Info Banner */}
          {userType === "seller" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                🎉 Ready to start selling?{" "}
                <span className="font-semibold">
                  Complete registration to set up your store!
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
