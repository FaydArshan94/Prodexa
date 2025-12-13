"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  fetchCurrentUser,
} from "../../lib/redux/actions/authActions";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchCart } from "@/lib/redux/actions/cartActions";
import { cartSocketService } from "@/lib/services/cartSocketService";

export default function Navbar() {
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const router = useRouter();

  // 🔍 Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);
  const pathname = usePathname();
  // Fetch live suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/api/products/search?q=${encodeURIComponent(searchTerm)}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 300);
  }, [searchTerm]);

  // Submit search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowDropdown(false);
    }
  };

  // Click on suggestion
  const handleSelectSuggestion = (text) => {
    setSearchTerm("");
    setShowDropdown(false);
    router.push(`/products?q=${encodeURIComponent(text)}`);
  };
  const { cart = [] } = useSelector((state) => state.cart);

  useEffect(() => {
    if (auth.user && auth.isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, auth.user, auth.isAuthenticated]);

  useEffect(() => {
    if (auth.user && auth.token) {
      cartSocketService.initialize(auth.token);
    }

    // return () => {
    //   if (!auth.user) {
    //     cartSocketService.disconnect();
    //   }
    // };
  }, [auth.user, auth.token]);

  // ✅ Fetch user on mount
  useEffect(() => {
    if (!auth.user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, auth.user]);

  // ✅ Fetch cart when user is authenticated
  useEffect(() => {
    if (auth.user && auth.isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, auth.user, auth.isAuthenticated]);

  return (
    <>
      {/* {showDropdown && suggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/40 z-[51]" onClick={() => setShowDropdown(false)} />
      )} */}
      <nav className="sticky top-0 z-50 md:py-2 w-full border-b bg-white">
        {/* Top Bar */}

        {/* Main Navbar */}
        <div className="container mx-auto px-4 py-4 md:py-1  ">
          <div className="flex items-center justify-between gap-4 md:flex-row flex-wrap md:flex-nowrap ">
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setSearchTerm("")}
              className="flex items-center"
            >
              <h1 className="text-2xl font-bold text-slate-900">
                PRO<span className="text-blue-600">DEXA</span>
              </h1>
            </Link>

            {pathname === "/products" && (
              <div className="md:pt-0 w-full order-last md:order-none  flex gap-6 overflow-x-auto  md:items-center md:justify-center">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl relative ">
                  <form onSubmit={handleSearch}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for products, brands and more..."
                      className="pl-10 pr-4"
                      onFocus={() => searchTerm && setShowDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 150)
                      }
                    />
                  </form>

                  {/* 🔽 Dropdown Suggestions */}
                </div>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center">
              {!auth.isAuthenticated ? (
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <Link
                    href="/login"
                    onClick={() => setSearchTerm("")}
                    className=" md:inline"
                  >
                    Login
                  </Link>
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button variant="ghost">
                    <Link
                      href="/profile"
                      onClick={() => setSearchTerm("")}
                      className="flex gap-1 items-center justify-between  "
                    >
                      <User className="h-5 w-5  " />
                      <span className="hidden md:inline">
                        {auth.user?.username.slice(0, 5)}
                      </span>
                    </Link>
                  </Button>

                  <Button
                    onClick={() => dispatch(logoutUser())}
                    variant="ghost"
                    className="text-center"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Cart Button */}
              <Button variant="ghost">
                <Link
                  href="/cart"
                  onClick={() => setSearchTerm("")}
                  className="relative flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {/* <span className="hidden md:inline"></span> */}
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                    {cart.length || 0}
                  </span>
                </Link>
              </Button>

              {/* Mobile Menu */}
              {/* <Button variant="ghost" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button> */}
            </div>
          </div>
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-1/2 -translate-x-1/2  z-[52]">
            <ul className="w-full bg-white border border-gray-200 shadow-xl rounded-md mt-1 max-h-[70vh] overflow-y-auto">
              {suggestions.map((item) => (
                <li
                  key={item._id}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-none"
                  onMouseDown={() => handleSelectSuggestion(item.title)}
                >
                  <div className="flex items-center gap-3">
                    {item.images?.[0]?.url && (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
