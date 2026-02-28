import { useEffect, useState } from 'react';
import { cartStore, CartItem } from '@/lib/cart-store';
import { Product } from '@/lib/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxable, setTaxable] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const updateState = () => {
    setItems(cartStore.getItems());
    setSubtotal(cartStore.getSubtotal());
    setDiscount(cartStore.getDiscount());
    setTaxable(cartStore.getTaxable());
    setTax(cartStore.getTax());
    setTotal(cartStore.getTotal());
  };

  useEffect(() => {
    updateState();
    const unsubscribe = cartStore.subscribe(updateState);
    return unsubscribe;
  }, []);

  return {
    items,
    subtotal,
    discount,
    taxable,
    tax,
    total,
    addItem: (product: Product, quantity?: number) => {
      cartStore.addItem(product, quantity);
    },
    removeItem: (productId: string) => {
      cartStore.removeItem(productId);
    },
    updateQuantity: (productId: string, quantity: number) => {
      cartStore.updateQuantity(productId, quantity);
    },
    setDiscount: (productId: string, discount: number) => {
      cartStore.setDiscount(productId, discount);
    },
    setCartDiscount: (discountPercent: number) => {
      cartStore.setCartDiscount(discountPercent);
    },
    clear: () => {
      cartStore.clear();
    },
  };
}
