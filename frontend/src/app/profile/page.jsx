"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateProfile, changePassword } from "@/lib/redux/actions/authActions";
import { clearError, clearSuccess } from "@/lib/redux/slices/authSlice";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, token, isLoading, error, success } = useSelector(
    (state) => state.auth
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch new password for confirmation validation
  const newPassword = watch("newPassword");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      resetProfile({
        username: user.username || "",
        email: user.email || "",
        firstName: user.fullName?.firstName || "",
        lastName: user.fullName?.lastName || "",
      });
    }
  }, [user, resetProfile]);

  // Show toast for success/error from Redux
  useEffect(() => {
    if (success) {
      showToast(success, "success");
      dispatch(clearSuccess());
    }
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  const onSubmitProfile = async (data) => {
    const profileData = {
      username: data.username,
      email: data.email,
      fullName: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    };

    const result = await dispatch(updateProfile({ token, profileData }));

    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const onSubmitPassword = async (data) => {
    const passwordData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    const result = await dispatch(changePassword({ token, passwordData }));

    if (changePassword.fulfilled.match(result)) {
      setIsChangingPassword(false);
      resetPassword();
      setShowPassword({ current: false, new: false, confirm: false });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      resetProfile({
        username: user.username || "",
        email: user.email || "",
        firstName: user.fullName?.firstName || "",
        lastName: user.fullName?.lastName || "",
      });
    }
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    resetPassword();
    setShowPassword({ current: false, new: false, confirm: false });
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Information Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update your personal details
                  </p>
                </div>
              </div>
              {!isEditing ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/orders"
                    className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all duration-200 font-medium shadow-sm"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-md"
                >
                  <X className="inline w-4 h-4 mr-1" /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...registerProfile("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters",
                        },
                      })}
                      disabled={!isEditing}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                    />
                  </div>
                  {profileErrors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {profileErrors.username.message}
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...registerProfile("firstName", {
                      required: "First name is required",
                    })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                  {profileErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {profileErrors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...registerProfile("lastName", {
                      required: "Last name is required",
                    })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                  {profileErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {profileErrors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      {...registerProfile("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email format",
                        },
                      })}
                      disabled={!isEditing}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                    >
                      <Save className="inline w-5 h-5 mr-2" />
                      {isLoading ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Security</h2>
                  <p className="text-sm text-gray-500">Manage your password</p>
                </div>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <div className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword.current ? "text" : "password"}
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword.new ? "text" : "password"}
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === newPassword || "Passwords do not match",
                        })}
                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                    >
                      <Save className="inline w-5 h-5 mr-2" />
                      {isLoading ? "Updating Password..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPassword}
                      className="px-6 py-3.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-md"
                    >
                      <X className="inline w-4 h-4 mr-1" /> Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
                <p className="text-gray-700 text-center">
                  Keep your account secure by regularly updating your password
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
