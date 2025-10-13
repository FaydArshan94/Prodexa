'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/products/ProductCard'
import FilterSidebar from '@/components/products/FilterSidebar'
import { Button } from '@/components/ui/button'
import { ChevronDown, Grid3x3, List, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

// Sample products data
const allProducts = [
  { id: 1, name: 'Wireless Headphones', price: 2999, originalPrice: 4999, rating: 4.5, reviews: 1240, image: '🎧', discount: '40% OFF', badge: 'Bestseller' },
  { id: 2, name: 'Smart Watch Pro', price: 5999, originalPrice: 9999, rating: 4.8, reviews: 856, image: '⌚', discount: '40% OFF', badge: 'New' },
  { id: 3, name: 'Running Shoes', price: 1999, originalPrice: 3999, rating: 4.3, reviews: 543, image: '👟', discount: '50% OFF', badge: 'Sale' },
  { id: 4, name: 'Laptop Backpack', price: 1299, originalPrice: 2499, rating: 4.6, reviews: 320, image: '🎒', discount: '48% OFF' },
  { id: 5, name: 'Coffee Maker', price: 3499, originalPrice: 5999, rating: 4.4, reviews: 678, image: '☕', discount: '42% OFF' },
  { id: 6, name: 'Gaming Mouse', price: 899, originalPrice: 1999, rating: 4.7, reviews: 1120, image: '🖱️', discount: '55% OFF', badge: 'Hot' },
  { id: 7, name: 'Sunglasses', price: 799, originalPrice: 1999, rating: 4.2, reviews: 234, image: '🕶️', discount: '60% OFF' },
  { id: 8, name: 'Water Bottle', price: 399, originalPrice: 799, rating: 4.5, reviews: 890, image: '💧', discount: '50% OFF' },
  { id: 9, name: 'Bluetooth Speaker', price: 1999, originalPrice: 3999, rating: 4.6, reviews: 567, image: '🔊', discount: '50% OFF', badge: 'Bestseller' },
  { id: 10, name: 'Fitness Tracker', price: 2499, originalPrice: 4999, rating: 4.4, reviews: 432, image: '⌚', discount: '50% OFF' },
  { id: 11, name: 'Desk Lamp', price: 899, originalPrice: 1799, rating: 4.3, reviews: 234, image: '💡', discount: '50% OFF' },
  { id: 12, name: 'Phone Case', price: 299, originalPrice: 599, rating: 4.1, reviews: 890, image: '📱', discount: '50% OFF' },
]

export default function ProductsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popular')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Products</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className={`hidden lg:block w-64 flex-shrink-0`}>
            <FilterSidebar />
          </aside>

          {/* Mobile Filter Sidebar */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFilters(false)}
                  >
                    ✕
                  </Button>
                </div>
                <FilterSidebar />
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
                  <h1 className="text-xl font-bold text-slate-900">All Products</h1>
                  <p className="text-sm text-slate-600">Showing {allProducts.length} results</p>
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
                      <option value="popular">Most Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rating</option>
                      <option value="newest">Newest First</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {allProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex justify-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">...</Button>
                <Button variant="outline">10</Button>
                <Button variant="outline">
                  Next
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}