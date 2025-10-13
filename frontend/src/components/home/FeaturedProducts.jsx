"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";

// Minimal sample products
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 2999,
    originalPrice: 4999,
    rating: 4.5,
    reviews: 1240,
    image: "🎧",
    discount: "40% OFF",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 5999,
    originalPrice: 9999,
    rating: 4.8,
    reviews: 856,
    image: "⌚",
    discount: "40% OFF",
    badge: "New",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 1999,
    originalPrice: 3999,
    rating: 4.3,
    reviews: 543,
    image: "👟",
    discount: "50% OFF",
    badge: "Sale",
  },
  {
    id: 4,
    name: "Laptop Backpack",
    price: 1299,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 320,
    image: "🎒",
    discount: "48% OFF",
    badge: "Hot",
  },
  {
    id: 5,
    name: "Coffee Maker",
    price: 3499,
    originalPrice: 5999,
    rating: 4.4,
    reviews: 678,
    image: "☕",
    discount: "42% OFF",
    badge: "Bestseller",
  },
  {
    id: 6,
    name: "Gaming Mouse",
    price: 899,
    originalPrice: 1999,
    rating: 4.7,
    reviews: 1120,
    image: "🖱️",
    discount: "55% OFF",
    badge: "New",
  },
  {
    id: 7,
    name: "Sunglasses",
    price: 799,
    originalPrice: 1999,
    rating: 4.2,
    reviews: 234,
    image: "🕶️",
    discount: "60% OFF",
    badge: "Sale",
  },
  {
    id: 8,
    name: "Water Bottle",
    price: 399,
    originalPrice: 799,
    rating: 4.5,
    reviews: 890,
    image: "💧",
    discount: "50% OFF",
    badge: "Eco",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Featured Products
            </h2>
            <p className="text-slate-600">Handpicked products just for you</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-blue-200"
            >
              {/* Product Image */}
              <div className="relative bg-slate-50 aspect-square flex items-center justify-center overflow-hidden">
                {/* Badge */}
                <Badge className="absolute top-3 left-3 z-10 bg-red-500">
                  {product.discount}
                </Badge>

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                </button>

                {/* Product Emoji/Image */}
                <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                  {product.image}
                </div>

                {/* Product Status Badge */}
                {product.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute bottom-3 left-3"
                  >
                    {product.badge}
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

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
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full gap-2 group-hover:bg-blue-600 transition-colors"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-10">
          <Button size="lg" variant="outline">
            <Link href="/products">Load More Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
