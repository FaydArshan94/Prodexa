'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, Heart } from 'lucide-react'

export default function ProductCard({ product }) {
  return (
    <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-blue-200">
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative bg-slate-50 aspect-square flex items-center justify-center overflow-hidden">
          {/* Discount Badge */}
          {product.discount && (
            <Badge className="absolute top-3 left-3 z-10 bg-red-500">
              {product.discount}
            </Badge>
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={(e) => {
              e.preventDefault()
              // Add to wishlist logic
            }}
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Product Image/Emoji */}
          <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
            {product.image}
          </div>

          {/* Product Badge */}
          {product.badge && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-3 left-3"
            >
              {product.badge}
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
            <Star className="h-3 w-3 fill-green-600 text-green-600" />
            <span className="text-sm font-semibold text-green-600">
              {product.rating}
            </span>
          </div>
          <span className="text-sm text-slate-500">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={(e) => {
            e.preventDefault()
            // Add to cart logic
          }}
          className="w-full gap-2 group-hover:bg-blue-600 transition-colors"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}