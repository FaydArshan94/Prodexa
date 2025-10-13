'use client'

import { Card } from '@/components/ui/card'
import { Laptop, Shirt, Home, Sparkles, Dumbbell, Book, Gamepad2, Watch } from 'lucide-react'
import Link from 'next/link'

const categories = [
  { name: 'Electronics', icon: Laptop, color: 'bg-blue-100 text-blue-600', items: '5000+ items' },
  { name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600', items: '8000+ items' },
  { name: 'Home & Kitchen', icon: Home, color: 'bg-green-100 text-green-600', items: '3000+ items' },
  { name: 'Beauty', icon: Sparkles, color: 'bg-purple-100 text-purple-600', items: '2000+ items' },
  { name: 'Sports', icon: Dumbbell, color: 'bg-orange-100 text-orange-600', items: '1500+ items' },
  { name: 'Books', icon: Book, color: 'bg-yellow-100 text-yellow-600', items: '4000+ items' },
  { name: 'Toys & Games', icon: Gamepad2, color: 'bg-red-100 text-red-600', items: '2500+ items' },
  { name: 'Watches', icon: Watch, color: 'bg-indigo-100 text-indigo-600', items: '1000+ items' },
]

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-slate-600 text-lg">
            Explore our wide range of products across different categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.name}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200"
              >
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  
                  {/* Category Name */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {category.items}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
           className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
            <Link href="/products">
              View All Categories →
            </Link>
          </button>
        </div>
      </div>
    </section>
  )
}