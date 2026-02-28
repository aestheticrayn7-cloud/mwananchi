'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import ProductSelector from '@/components/pos/product-selector';
import Cart from '@/components/pos/cart';
import CheckoutPanel from '@/components/pos/checkout-panel';

export default function POSPage() {
  const { products, isLoading } = useProducts();
  const { user } = useAuth();
  const cart = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* Left: Product Selector */}
        <div className="flex-1 flex flex-col min-w-0">
          <ProductSelector
            products={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddItem={(product) => cart.addItem(product)}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Cart & Checkout */}
        <div className="w-96 flex flex-col gap-4">
          {!showCheckout ? (
            <>
              <Cart cart={cart} />
              <button
                onClick={() => setShowCheckout(true)}
                disabled={cart.items.length === 0}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 transition"
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            <CheckoutPanel
              cart={cart}
              user={user}
              onBack={() => setShowCheckout(false)}
              onComplete={() => {
                cart.clear();
                setShowCheckout(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
