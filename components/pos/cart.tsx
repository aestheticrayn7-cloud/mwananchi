'use client';

import { Trash2, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

interface CartProps {
  cart: ReturnType<typeof useCart>;
}

export default function Cart({ cart }: CartProps) {
  if (cart.items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center h-full">
        <p className="text-gray-600 text-center">Cart is empty. Add items to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Items List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.product.id}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-600">{item.product.sku}</p>
                </div>
                <button
                  onClick={() => cart.removeItem(item.product.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-gray-100 rounded">
                  <button
                    onClick={() =>
                      cart.updateQuantity(
                        item.product.id,
                        item.quantity - 1
                      )
                    }
                    className="p-1 hover:bg-gray-200 transition"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-2 text-sm font-semibold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      cart.updateQuantity(
                        item.product.id,
                        item.quantity + 1
                      )
                    }
                    className="p-1 hover:bg-gray-200 transition"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <p className="font-bold text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(cart.subtotal)}
          </span>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>Discount</span>
            <span className="font-semibold">
              -{formatCurrency(cart.discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (16%)</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(cart.tax)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-emerald-600">
            {formatCurrency(cart.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
