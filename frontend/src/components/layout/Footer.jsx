'use client'

import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Shield, Truck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: About & Newsletter */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              PRO<span className="text-blue-500">DEXA</span>
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Your one-stop destination for quality products from trusted sellers. Shop electronics, fashion, home essentials and more at amazing prices.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Subscribe to Newsletter</h3>
              <p className="text-sm text-slate-400">Get updates on new products and special offers!</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3">Follow Us</h3>
              <div className="flex gap-3">
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop by Category</h3>
            <ul className="space-y-2">
              <li><Link href="/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/category/fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/category/home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
              <li><Link href="/category/beauty" className="hover:text-white transition-colors">Beauty & Personal Care</Link></li>
              <li><Link href="/category/sports" className="hover:text-white transition-colors">Sports & Fitness</Link></li>
              <li><Link href="/category/books" className="hover:text-white transition-colors">Books & Stationery</Link></li>
              <li><Link href="/category/toys" className="hover:text-white transition-colors">Toys & Games</Link></li>
              <li><Link href="/category/automotive" className="hover:text-white transition-colors">Automotive</Link></li>
              <li><Link href="/category/grocery" className="hover:text-white transition-colors">Grocery & Gourmet</Link></li>
              <li><Link href="/categories" className="text-blue-400 hover:text-blue-300 font-semibold">View All →</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/payment" className="hover:text-white transition-colors">Payment Methods</Link></li>
              <li><Link href="/warranty" className="hover:text-white transition-colors">Warranty Policy</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Company & Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 mb-6">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors">Press & Media</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/seller" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
            </ul>

            <h3 className="text-white font-semibold mb-4">Policies</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Contact Info Bar */}
        <div className="border-t border-slate-800 mt-10 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Call Us</h4>
                <p className="text-sm">+91 1800-123-4567</p>
                <p className="text-sm text-slate-400">Mon-Sat: 9AM - 9PM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Email Us</h4>
                <p className="text-sm">support@prodexa.com</p>
                <p className="text-sm text-slate-400">24/7 Email Support</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Head Office</h4>
                <p className="text-sm">123 Business Plaza, Sector 18</p>
                <p className="text-sm text-slate-400">Noida, UP 201301, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-slate-800 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="text-white font-semibold">Free Shipping</h4>
              <p className="text-sm text-slate-400">On orders above ₹499</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-slate-800 p-3 rounded-full">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="text-white font-semibold">Secure Payment</h4>
              <p className="text-sm text-slate-400">100% secure transactions</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-slate-800 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="text-white font-semibold">Easy Returns</h4>
              <p className="text-sm text-slate-400">7 days return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-slate-400">
              © 2024 Prodexa. All rights reserved. Designed with ❤️ in India
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">We Accept:</span>
              <div className="flex gap-2">
                <div className="bg-white px-2 py-1 rounded text-xs font-semibold text-slate-900">VISA</div>
                <div className="bg-white px-2 py-1 rounded text-xs font-semibold text-slate-900">UPI</div>
                <div className="bg-white px-2 py-1 rounded text-xs font-semibold text-slate-900">Razorpay</div>
                <div className="bg-white px-2 py-1 rounded text-xs font-semibold text-slate-900">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}