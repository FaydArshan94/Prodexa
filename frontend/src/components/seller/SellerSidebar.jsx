'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Store,
  Users,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/seller/customers', icon: Users },
  { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/seller/notifications', icon: Bell },
  { name: 'Settings', href: '/seller/settings', icon: Settings },
]

export default function SellerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/seller/dashboard" className="flex items-center gap-2">
          <Store className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-xl font-bold">PRO<span className="text-blue-500">DEXA</span></h2>
            <p className="text-xs text-slate-400">Seller Panel</p>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
            JS
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">John's Store</p>
            <p className="text-xs text-slate-400 truncate">john@store.com</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full gap-2 text-slate-300 border-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}