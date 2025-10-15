"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../lib/redux/actions/authActions";
import { use, useEffect } from "react";

export default function Navbar() {
  const auth = useSelector((state) => state.auth);





  const dispatch = useDispatch();



  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      {/* Top Bar */}
      <div className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <Link
              href="/seller"
              className="text-slate-600 hover:text-slate-900"
            >
              Become a Seller
            </Link>
            <Link
              href="/track-order"
              className="text-slate-600 hover:text-slate-900"
            >
              Track Order
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="/help" className="text-slate-600 hover:text-slate-900">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-900">
              PRO<span className="text-blue-600">DEXA</span>
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search for products, brands and more..."
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Login Button */}
            {!auth.isAuthenticated ? (
              <Button variant="ghost" className="gap-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">
                  <Link href="/login">Login</Link>
                </span>
              </Button>
            ) : (
              <div>
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">
                    <Link href="/profile">{auth.user?.username}</Link>
                  </span>
                </Button>

                <Button
                  onClick={() => {
                    dispatch(logoutUser());
                  }}
                  variant="ghost" className="text-center">
                  <LogOut className="h-5 w-5" />
                  
                </Button>
              </div>
            )}

            {/* Cart Button */}
            <Button variant="ghost" className="gap-2 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline">
                <Link href="/cart">Cart</Link>
              </span>
              {/* Cart Count Badge */}
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
          {[
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Beauty",
            "Sports",
            "Books",
            "Toys",
          ].map((category) => (
            <Link
              key={category}
              href={`/category/${category.toLowerCase()}`}
              className="text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
