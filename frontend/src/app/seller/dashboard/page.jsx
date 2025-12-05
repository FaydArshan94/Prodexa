"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  LogOut,
} from "lucide-react";
import {
  getSellerMetrics,
  getSellerOrders,
  getSellerProducts,
} from "@/lib/redux/actions/sellerActions";
import Link from "next/link";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/redux/actions/productActions";
import { AlertCircle, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { logoutUser } from "@/lib/redux/actions/authActions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");
    const router = useRouter();
  

  const { user, token } = useSelector((state) => state.auth);
  const {
    metrics,
    products = [],
    orders,
    isLoading,
  } = useSelector((state) => state.seller);

  // console.log(orders);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // const [formData, setFormData] = useState({
  //   title: "",
  //   description: "",
  //   priceAmount: "",
  //   priceCurrency: "INR",
  //   stock: "",
  // });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  // const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(getSellerMetrics(token));
      dispatch(getSellerOrders(token));
      dispatch(getSellerProducts(token));
    }
  }, [token, dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priceAmount: "",
      priceCurrency: "INR",
      stock: "",
    },
  });

  const handleDeleteProduct = async (productId) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteProduct(productId)).unwrap();
      alert("Product deleted successfully!");
      // Refresh products list
      await dispatch(getSellerProducts(token));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error || "Failed to delete product");
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);

    // Populate form with product data
    setValue("title", product.title);
    setValue("description", product.description);
    setValue("priceAmount", product.price?.amount || "");
    setValue("priceCurrency", product.price?.currency || "INR");
    setValue("stock", product.stock || "");

    // Set existing images as previews
    const existingPreviews = product.images?.map((img) => img.url) || [];
    setImagePreviews(existingPreviews);
    setShowProductModal(true);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Shipped: "bg-blue-100 text-blue-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    setSelectedImages([...selectedImages, ...files]);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.priceAmount || formData.priceAmount <= 0) {
      errors.priceAmount = "Valid price is required";
    }

    if (!formData.stock || formData.stock < 0) {
      errors.stock = "Valid stock quantity is required";
    }

    // Only require images for new products, not for editing
    if (!selectedProduct && selectedImages.length === 0) {
      errors.images = "At least one image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const onSubmit = async (data) => {
    // Validate images
    if (!selectedProduct && selectedImages.length === 0) {
      alert("At least one image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const productFormData = new FormData();
      productFormData.append("title", data.title);
      productFormData.append("description", data.description);
      productFormData.append("priceAmount", data.priceAmount);
      productFormData.append("priceCurrency", data.priceCurrency);
      productFormData.append("stock", data.stock);

      // Append all selected images (only new images, not existing URLs)
      selectedImages.forEach((image) => {
        productFormData.append("images", image);
      });

      if (selectedProduct) {
        // UPDATE existing product
        await dispatch(
          updateProduct({
            productId: selectedProduct._id,
            productData: productFormData,
          })
        ).unwrap();
        alert("Product updated successfully!");
      } else {
        // CREATE new product
        await dispatch(createProduct(productFormData)).unwrap();
        alert("Product created successfully!");
      }

      // Success - refresh products and close modal
      await dispatch(getSellerProducts(token));
      setShowProductModal(false);
      resetForm();
    } catch (error) {
      console.log("Error:", error);

      alert(
        error || `Failed to ${selectedProduct ? "update" : "create"} product`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset({
      title: "",
      description: "",
      priceAmount: "",
      priceCurrency: "INR",
      stock: "",
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setSelectedProduct(null);
  };



  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };


  const handleAddProductClick = () => {
    resetForm();
    setShowProductModal(true);
  };

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sales</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {metrics?.sales || 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics?.revenue || 0, "INR")}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {products?.data?.length || 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Top Selling Products
        </h3>
        <div className="space-y-3">
          {metrics?.topProducts?.length > 0 ? (
            metrics.topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {product.title}
                  </span>
                </div>
                <span className="text-blue-600 font-semibold">
                  {product.sold} sold
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No sales data yet</p>
          )}
        </div>
      </div>
    </div>
  );

  // Products Tab
  const ProductsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <button
          onClick={handleAddProductClick} // Add this
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {products?.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.data.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition"
            >
              <img
                src={
                  product.images?.[0]?.url || "https://via.placeholder.com/300"
                }
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(product.price?.amount, product.currency)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Stock: {product?.stock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Products Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding products to your store
          </p>
          <button
            onClick={handleAddProductClick} // Add this
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );

  // Orders Tab
  const OrdersTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

      {orders?.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.user?.username || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(
                        order.totalPrice?.amount || 0,
                        order.totalPrice?.currency || "INR"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Orders Yet
          </h3>
          <p className="text-gray-600">
            Orders will appear here when customers purchase your products
          </p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
  ];

  if (user && !user.role?.includes("seller")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You do not have seller privileges. Please contact support if you
            believe this is an error.
          </p>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Register as Seller
          </Link>
        </div>
      </div>
    );
  }

  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={() => {
                setShowProductModal(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                })}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  {...register("priceAmount", {
                    required: "Price is required",
                    min: {
                      value: 0.01,
                      message: "Price must be greater than 0",
                    },
                  })}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.priceAmount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.priceAmount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.priceAmount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  {...register("stock", {
                    required: "Stock is required",
                    min: {
                      value: 0,
                      message: "Stock cannot be negative",
                    },
                  })}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images * (Max 5)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={selectedImages.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedImages.length}/5 images selected
                  </p>
                </label>
              </div>

              {!selectedProduct && selectedImages.length === 0 && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  At least one image is required
                </p>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting
                  ? "Saving..."
                  : selectedProduct
                  ? "Update Product"
                  : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                  resetForm();
                }}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Seller Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user?.username}</p>
              </div>
              <Button
                onClick={(handleLogout)}
                variant="ghost"
                className="text-center"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "orders" && <OrdersTab />}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">
                      {selectedOrder.user?.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state}
                    </p>
                    <p>
                      {selectedOrder.shippingAddress?.pincode},{" "}
                      {selectedOrder.shippingAddress?.country}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Order Items</p>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.product?.title}
                        </span>
                        <span>x{item.quantity}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(
                          item.price?.amount,
                          item.price?.currency
                        )}{" "}
                        each
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        selectedOrder.totalPrice?.amount,
                        selectedOrder.totalPrice?.currency
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Update Status
                  </button>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && <AddProductModal />}
    </div>
  );
}
