'use client'

import SellerSidebar from '@/components/seller/SellerSidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users,
  Eye,
  MoreHorizontal
} from 'lucide-react'

// Mock data
const stats = [
  {
    title: 'Total Revenue',
    value: '₹2,45,690',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    title: 'Total Orders',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    title: 'Total Products',
    value: '48',
    change: '+3',
    trend: 'up',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    title: 'Total Customers',
    value: '892',
    change: '+15.3%',
    trend: 'up',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
]

const recentOrders = [
  { id: '#ORD-001', customer: 'Amit Kumar', product: 'Wireless Headphones', amount: 2999, status: 'Delivered', date: '14 Oct 2024' },
  { id: '#ORD-002', customer: 'Priya Sharma', product: 'Smart Watch', amount: 5999, status: 'Processing', date: '14 Oct 2024' },
  { id: '#ORD-003', customer: 'Rahul Verma', product: 'Running Shoes', amount: 1999, status: 'Shipped', date: '13 Oct 2024' },
  { id: '#ORD-004', customer: 'Neha Singh', product: 'Coffee Maker', amount: 3499, status: 'Pending', date: '13 Oct 2024' },
  { id: '#ORD-005', customer: 'Vikram Patel', product: 'Gaming Mouse', amount: 899, status: 'Delivered', date: '12 Oct 2024' },
]

const topProducts = [
  { name: 'Wireless Headphones', sales: 145, revenue: '₹4,34,550', image: '🎧' },
  { name: 'Smart Watch Pro', sales: 98, revenue: '₹5,87,902', image: '⌚' },
  { name: 'Running Shoes', sales: 76, revenue: '₹1,51,924', image: '👟' },
  { name: 'Gaming Mouse', sales: 65, revenue: '₹58,435', image: '🖱️' },
]

const getStatusColor = (status) => {
  switch(status) {
    case 'Delivered': return 'bg-green-100 text-green-700'
    case 'Shipped': return 'bg-blue-100 text-blue-700'
    case 'Processing': return 'bg-yellow-100 text-yellow-700'
    case 'Pending': return 'bg-orange-100 text-orange-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

export default function SellerDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SellerSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your store.</p>
              </div>
              <Button className="gap-2">
                <Package className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
              
              return (
                <Card key={stat.title} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="h-4 w-4" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-slate-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </Card>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Order ID</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Customer</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Product</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-slate-50">
                        <td className="p-4">
                          <span className="font-semibold text-slate-900">{order.id}</span>
                          <p className="text-xs text-slate-500">{order.date}</p>
                        </td>
                        <td className="p-4 text-slate-700">{order.customer}</td>
                        <td className="p-4 text-slate-700">{order.product}</td>
                        <td className="p-4 font-semibold text-slate-900">₹{order.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Top Products */}
            <Card>
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                      {product.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Add New Product</h3>
                  <p className="text-sm text-slate-600">List a new product</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Manage Orders</h3>
                  <p className="text-sm text-slate-600">View all orders</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">View Analytics</h3>
                  <p className="text-sm text-slate-600">Sales insights</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}