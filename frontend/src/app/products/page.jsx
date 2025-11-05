"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation"; // Add this import
import {
  fetchProducts,
  searchProducts,
} from "@/lib/redux/actions/productActions";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import {
  ChevronDown,
  Grid3x3,
  List,
  SlidersHorizontal,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams(); // Add this hook
  const { products = [], isLoading } = useSelector((state) => state.products);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [tempPriceRange, setTempPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;
  const skip = (page - 1) * limit;

  // Initialize search query from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Fetch products on filter change
  useEffect(() => {
    const params = {
      skip,
      limit,
    };

    // Add price range filters if they exist and are valid
    if (priceRange.min && Number(priceRange.min) >= 0) {
      params.minprice = Number(priceRange.min);
    }
    if (priceRange.max && Number(priceRange.max) >= 0) {
      params.maxprice = Number(priceRange.max);
    }

    // If there's a search query, use searchProducts
    if (searchQuery?.trim()) {
      params.q = searchQuery.trim();
      dispatch(searchProducts(params));
    } else {
      // Otherwise fetch all products with filters
      dispatch(fetchProducts(params));
    }
  }, [dispatch, searchQuery, priceRange.min, priceRange.max, skip, limit]);

  // Client-side sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price_asc") {
      return (a.price?.amount || 0) - (b.price?.amount || 0);
    }
    if (sortBy === "price_desc") {
      return (b.price?.amount || 0) - (a.price?.amount || 0);
    }
    return 0;
  });

  const handlePriceFilter = () => {
    const min = tempPriceRange.min ? Number(tempPriceRange.min) : "";
    const max = tempPriceRange.max ? Number(tempPriceRange.max) : "";

    // Validate price range
    if (min !== "" && max !== "" && min > max) {
      alert("Minimum price cannot be greater than maximum price");
      return;
    }

    // Validate that the values are valid numbers
    if (min !== "" && (!Number.isFinite(min) || min < 0)) {
      alert("Please enter a valid minimum price");
      return;
    }

    if (max !== "" && (!Number.isFinite(max) || max < 0)) {
      alert("Please enter a valid maximum price");
      return;
    }

    // Update price range and reset to first page
    setPriceRange({ min, max });
    setPage(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setTempPriceRange({ min: "", max: "" });
    setSortBy("");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || priceRange.min || priceRange.max;

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
            <span className="text-slate-900 font-medium">Products</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            {/* Price Range Filter */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Price Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    value={tempPriceRange.min}
                    onChange={(e) =>
                      setTempPriceRange({
                        ...tempPriceRange,
                        min: e.target.value,
                      })
                    }
                    placeholder="₹ Min"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    value={tempPriceRange.max}
                    onChange={(e) =>
                      setTempPriceRange({
                        ...tempPriceRange,
                        max: e.target.value,
                      })
                    }
                    placeholder="₹ Max"
                    min="0"
                  />
                </div>
                <Button
                  onClick={handlePriceFilter}
                  className="w-full"
                  variant="outline"
                >
                  Apply Filter
                </Button>
              </div>
            </Card>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full gap-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </aside>

          {/* Mobile Filter Sidebar */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(false)}
                    size="sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile filters */}
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Price Range
                    </h3>
                    <div className="space-y-3">
                      <Input
                        type="number"
                        value={tempPriceRange.min}
                        onChange={(e) =>
                          setTempPriceRange({
                            ...tempPriceRange,
                            min: e.target.value,
                          })
                        }
                        placeholder="₹ Min"
                        min="0"
                      />
                      <Input
                        type="number"
                        value={tempPriceRange.max}
                        onChange={(e) =>
                          setTempPriceRange({
                            ...tempPriceRange,
                            max: e.target.value,
                          })
                        }
                        placeholder="₹ Max"
                        min="0"
                      />
                      <Button
                        onClick={handlePriceFilter}
                        className="w-full"
                        variant="outline"
                      >
                        Apply Filter
                      </Button>
                    </div>
                  </Card>

                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full gap-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Sort & View Options */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Results Count */}
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {isLoading
                      ? "Loading..."
                      : `Showing ${sortedProducts.length} results`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    className="lg:hidden gap-2"
                    onClick={() => setShowFilters(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Default</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${
                        viewMode === "grid"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${
                        viewMode === "list"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchQuery && (
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setPage(1);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {priceRange.min && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Min: ₹{priceRange.min}
                      <button
                        onClick={() => {
                          setPriceRange({ ...priceRange, min: "" });
                          setTempPriceRange({ ...tempPriceRange, min: "" });
                          setPage(1);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {priceRange.max && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Max: ₹{priceRange.max}
                      <button
                        onClick={() => {
                          setPriceRange({ ...priceRange, max: "" });
                          setTempPriceRange({ ...tempPriceRange, max: "" });
                          setPage(1);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600">Loading products...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedProducts.length === 0 && (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-slate-600 mb-4">
                  Try adjusting your filters or search query
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>Clear Filters</Button>
                )}
              </Card>
            )}

            {/* Products Grid */}
            {!isLoading && sortedProducts.length > 0 && (
              <>
                <div
                  className={`grid ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  } gap-6`}
                >
                  {sortedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm font-medium">
                      Page {page}
                    </span>
                    <Button
                      variant="outline"
                      disabled={sortedProducts.length < limit}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}