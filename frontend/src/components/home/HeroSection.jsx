"use client";

import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/redux/actions/authActions";
import { fetchProducts } from "@/lib/redux/actions/productActions";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HeroSection() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const products = useSelector((state) => state.products);

  const getUser = async () => {
    try {
      const response = await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    getUser();
    fetchProducts()
  }, []);


  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>New Collection 2024 for {auth.user?.username}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Shop Smart,
              <br />
              Live <span className="text-blue-600">Better</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 leading-relaxed">
              Discover amazing products from trusted sellers. Get the best deals
              on electronics, fashion, home essentials and more.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
             <Link href="/products">
               <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                Start Shopping
                <ArrowRight className="h-5 w-5" />
              </Button>
             </Link>
              <Button size="lg" variant="outline">
                Browse Categories
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold text-slate-900">50K+</div>
                <div className="text-sm text-slate-600">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">10K+</div>
                <div className="text-sm text-slate-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">500+</div>
                <div className="text-sm text-slate-600">Sellers</div>
              </div>
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="relative">
            {/* Placeholder for product image - you can add real image later */}
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-slate-700 font-medium">Your Products Here</p>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-sm">Fast Delivery</div>
                  <div className="text-xs text-slate-600">2-3 Days</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  ⭐
                </div>
                <div>
                  <div className="font-semibold text-sm">Top Rated</div>
                  <div className="text-xs text-slate-600">4.8/5 Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
