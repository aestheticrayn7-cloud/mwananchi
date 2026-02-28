'use client';

import { Search, Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ProductSelectorProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddItem: (product: Product) => void;
  isLoading: boolean;
}

export default function ProductSelector({
  products,
  searchQuery,
  onSearchChange,
  onAddItem,
  isLoading,
}: ProductSelectorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-lg transition cursor-pointer"
                onClick={() => onAddItem(product)}
              >
                <p className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-600 mb-2">SKU: {product.sku}</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(product.price)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem(product);
                    }}
                    className="p-2 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Stock: {product.quantity_in_stock}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
