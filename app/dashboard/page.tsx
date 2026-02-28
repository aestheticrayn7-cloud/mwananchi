'use client';

import { useAuth } from '@/hooks/use-auth';
import { useProducts } from '@/hooks/use-products';
import { BarChart3, Package, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { store } = useAuth();
  const { products } = useProducts();

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      href: '/dashboard/products',
    },
    {
      label: 'Low Stock',
      value: products.filter(p => p.quantity_in_stock <= p.reorder_level).length,
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600',
      href: '/dashboard/products',
    },
    {
      label: 'Total Value',
      value: (products.reduce((sum, p) => sum + p.price * p.quantity_in_stock, 0) / 1000).toFixed(1) + 'K',
      icon: ShoppingCart,
      color: 'bg-green-100 text-green-600',
      href: '/dashboard/pos',
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to {store?.name}
        </h1>
        <p className="text-gray-600">Here's an overview of your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/pos"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition"
          >
            <ShoppingCart className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-gray-900">Start Sale</p>
              <p className="text-sm text-gray-600">Create a new transaction</p>
            </div>
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition"
          >
            <Package className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-gray-900">Manage Stock</p>
              <p className="text-sm text-gray-600">Add or edit products</p>
            </div>
          </Link>
          <Link
            href="/dashboard/customers"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition"
          >
            <Users className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-gray-900">Manage Customers</p>
              <p className="text-sm text-gray-600">View customer accounts</p>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition"
          >
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Sales and inventory reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
