'use client';

import { useState } from 'react';
import { ArrowLeft, DollarSign, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { User } from '@/lib/types';

interface CheckoutPanelProps {
  cart: any;
  user: User | null;
  onBack: () => void;
  onComplete: () => void;
}

export default function CheckoutPanel({
  cart,
  user,
  onBack,
  onComplete,
}: CheckoutPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const change = amountReceived
    ? Math.max(0, parseFloat(amountReceived) - cart.total)
    : 0;

  const handleCheckout = async () => {
    setError('');

    if (!amountReceived || parseFloat(amountReceived) < cart.total) {
      setError('Amount received must be greater than or equal to total');
      return;
    }

    setIsProcessing(true);

    try {
      // Create transaction
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          items: cart.items,
          subtotal: cart.subtotal,
          discount_amount: cart.discount,
          tax_amount: cart.tax,
          net_amount: cart.total,
          payment_method: paymentMethod,
          amount_received: parseFloat(amountReceived),
          change,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete transaction');
      }

      // Show success and complete
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('[v0] Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Payment Method
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition ${
                paymentMethod === 'cash'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('mpesa')}
              className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition ${
                paymentMethod === 'mpesa'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">M-Pesa</span>
            </button>
          </div>
        </div>

        {/* Amount Received */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Amount Received
          </label>
          <input
            type="number"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-sm text-orange-600">
              <span>Discount</span>
              <span>-{formatCurrency(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold">{formatCurrency(cart.tax)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(cart.total)}
            </span>
          </div>
        </div>

        {/* Change */}
        {amountReceived && parseFloat(amountReceived) >= cart.total && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Change</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(change)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <button
          onClick={handleCheckout}
          disabled={isProcessing || !amountReceived || parseFloat(amountReceived) < cart.total}
          className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 transition"
        >
          {isProcessing ? 'Processing...' : 'Complete Sale'}
        </button>
      </div>
    </div>
  );
}
