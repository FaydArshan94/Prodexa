'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Check, MapPin, CreditCard, Wallet, Banknote } from 'lucide-react'

// Mock cart items
const cartItems = [
  { id: 1, name: 'Wireless Headphones', price: 2999, image: '🎧', quantity: 1 },
  { id: 2, name: 'Smart Watch Pro', price: 5999, image: '⌚', quantity: 2 },
]

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1) // 1: Address, 2: Payment
  const [selectedPayment, setSelectedPayment] = useState('cod')
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
  })

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryCharges = 0
  const total = subtotal + deliveryCharges

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleContinueToPayment = (e) => {
    e.preventDefault()
    setCurrentStep(2)
  }

  const handlePlaceOrder = () => {
    alert('Order placed successfully! 🎉')
    // In real app: API call to place order
  }

  const steps = [
    { number: 1, name: 'Cart', completed: true },
    { number: 2, name: 'Address', completed: currentStep > 1 },
    { number: 3, name: 'Payment', completed: false },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-slate-900">Cart</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed || currentStep >= step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.completed ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <span className={`font-medium ${
                    currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    step.completed ? 'bg-green-600' : 'bg-slate-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
                </div>
                <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
              </div>

              {currentStep === 1 ? (
                <form onSubmit={handleContinueToPayment} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mobile Number *
                      </label>
                      <Input
                        name="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Pincode *
                      </label>
                      <Input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="6 digits [0-9] PIN code"
                        required
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Locality *
                      </label>
                      <Input
                        name="locality"
                        value={formData.locality}
                        onChange={handleInputChange}
                        placeholder="Locality/Town"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address (House No, Building, Street, Area) *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete address"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        City/District *
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City/District"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select State</option>
                        <option value="UP">Uttar Pradesh</option>
                        <option value="MH">Maharashtra</option>
                        <option value="DL">Delhi</option>
                        <option value="KA">Karnataka</option>
                        <option value="TN">Tamil Nadu</option>
                        <option value="WB">West Bengal</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-6">
                    Continue to Payment
                  </Button>
                </form>
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{formData.fullName}</p>
                      <p className="text-slate-600 mt-1">{formData.address}</p>
                      <p className="text-slate-600">{formData.locality}, {formData.city}</p>
                      <p className="text-slate-600">{formData.state} - {formData.pincode}</p>
                      <p className="text-slate-600 mt-2">Mobile: {formData.mobile}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Step 2: Payment Method */}
            {currentStep >= 2 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {/* UPI */}
                  <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={selectedPayment === 'upi'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-5 h-5"
                    />
                    <Wallet className="h-6 w-6 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">UPI</div>
                      <div className="text-sm text-slate-500">Pay using Google Pay, PhonePe, Paytm</div>
                    </div>
                  </label>

                  {/* Card */}
                  <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === 'card'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-5 h-5"
                    />
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Credit/Debit Card</div>
                      <div className="text-sm text-slate-500">Visa, Mastercard, RuPay</div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === 'cod'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-5 h-5"
                    />
                    <Banknote className="h-6 w-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Cash on Delivery</div>
                      <div className="text-sm text-slate-500">Pay when you receive</div>
                    </div>
                  </label>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              </Card>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

              {/* Products */}
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded flex items-center justify-center text-2xl">
                      {item.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      <p className="font-semibold text-slate-900">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Safe Checkout */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-700 font-semibold">
                  🔒 Safe and Secure Payment
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}