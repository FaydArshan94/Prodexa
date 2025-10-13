'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Star, X } from 'lucide-react'

export default function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRatings, setSelectedRatings] = useState([])

  const categories = [
    { name: 'Electronics', count: 1240 },
    { name: 'Fashion', count: 2156 },
    { name: 'Home & Kitchen', count: 856 },
    { name: 'Beauty', count: 432 },
    { name: 'Sports', count: 678 },
    { name: 'Books', count: 945 },
    { name: 'Toys', count: 523 },
  ]

  const ratings = [4, 3, 2, 1]

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating))
    } else {
      setSelectedRatings([...selectedRatings, rating])
    }
  }

  const clearFilters = () => {
    setPriceRange([0, 10000])
    setSelectedCategories([])
    setSelectedRatings([])
  }

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedRatings.length > 0) && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Active Filters</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-red-500 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(cat => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleCategory(cat)}
                />
              </Badge>
            ))}
            {selectedRatings.map(rating => (
              <Badge key={rating} variant="secondary" className="gap-1">
                {rating}★ & above
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleRating(rating)}
                />
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Categories Filter */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label 
              key={category.name}
              className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => toggleCategory(category.name)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-slate-700">{category.name}</span>
              </div>
              <span className="text-xs text-slate-400">({category.count})</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Price Range Filter */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">₹{priceRange[0]}</span>
            <span className="text-slate-600">₹{priceRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPriceRange([0, 1000])}
              className="flex-1 text-xs"
            >
              Under ₹1000
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPriceRange([1000, 5000])}
              className="flex-1 text-xs"
            >
              ₹1K - ₹5K
            </Button>
          </div>
        </div>
      </Card>

      {/* Rating Filter */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Customer Rating</h3>
        <div className="space-y-2">
          {ratings.map(rating => (
            <label 
              key={rating}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedRatings.includes(rating)}
                onChange={() => toggleRating(rating)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-slate-700">{rating} & above</span>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Discount Filter */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Discount</h3>
        <div className="space-y-2">
          {['50% or more', '40% or more', '30% or more', '20% or more', '10% or more'].map(discount => (
            <label 
              key={discount}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-slate-700">{discount}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Availability Filter */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Availability</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-slate-700">In Stock</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-slate-700">Include Out of Stock</span>
          </label>
        </div>
      </Card>
    </div>
  )
}