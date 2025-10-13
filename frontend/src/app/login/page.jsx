'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, ShoppingBag, Store, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState('customer') // 'customer' or 'seller'
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In real app: API call to login
    alert(`${userType === 'customer' ? 'Customer' : 'Seller'} Login Successful! 🎉`)
    
    // Redirect based on user type
    if (userType === 'seller') {
      router.push('/seller/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
            <p className="text-slate-600">Login to continue shopping</p>
          </div>

          <Card className="p-8 shadow-xl">
            {/* User Type Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setUserType('customer')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  userType === 'customer'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                Customer
              </button>
              <button
                onClick={() => setUserType('seller')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  userType === 'seller'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="h-5 w-5" />
                Seller
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Login as {userType === 'customer' ? 'Customer' : 'Seller'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2">
                <span className="text-xl">G</span>
                Google
              </Button>
              <Button variant="outline" className="gap-2">
                <span className="text-xl">f</span>
                Facebook
              </Button>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Register Now
                </Link>
              </p>
            </div>
          </Card>

          {/* Info Banner */}
          {userType === 'seller' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                🎉 New to selling? <Link href="/seller/register" className="font-semibold underline">Start selling today!</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}