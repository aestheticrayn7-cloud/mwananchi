import { Product } from './types';

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface CartState {
  items: CartItem[];
  discountPercent: number;
  taxPercent: number;
}

class CartStore {
  private state: CartState = {
    items: [],
    discountPercent: 0,
    taxPercent: 16, // 16% VAT for Kenya
  };

  private listeners: Set<() => void> = new Set();

  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.state.items.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.state.items.push({
        product,
        quantity,
        discount: 0,
      });
    }

    this.notifyListeners();
  }

  removeItem(productId: string) {
    this.state.items = this.state.items.filter(item => item.product.id !== productId);
    this.notifyListeners();
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.state.items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(productId);
      } else {
        this.notifyListeners();
      }
    }
  }

  setDiscount(productId: string, discount: number) {
    const item = this.state.items.find(i => i.product.id === productId);
    if (item) {
      item.discount = discount;
      this.notifyListeners();
    }
  }

  setCartDiscount(discountPercent: number) {
    this.state.discountPercent = discountPercent;
    this.notifyListeners();
  }

  setTaxPercent(taxPercent: number) {
    this.state.taxPercent = taxPercent;
    this.notifyListeners();
  }

  getItems(): CartItem[] {
    return [...this.state.items];
  }

  getSubtotal(): number {
    return this.state.items.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      return sum + (itemTotal - item.discount);
    }, 0);
  }

  getDiscount(): number {
    const subtotal = this.getSubtotal();
    return (subtotal * this.state.discountPercent) / 100;
  }

  getTaxable(): number {
    return this.getSubtotal() - this.getDiscount();
  }

  getTax(): number {
    return (this.getTaxable() * this.state.taxPercent) / 100;
  }

  getTotal(): number {
    return this.getTaxable() + this.getTax();
  }

  clear() {
    this.state.items = [];
    this.state.discountPercent = 0;
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const cartStore = new CartStore();
