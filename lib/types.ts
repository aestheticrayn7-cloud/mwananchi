// User and Authentication Types
export interface User {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'cashier' | 'manager'
  shop_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthSession {
  token: string
  user: User
  expiresAt: number
}

// Shop Types
export interface Shop {
  id: string
  name: string
  location: string
  currency: string
  timezone: string
  owner_id: string
  created_at: string
  updated_at: string
}

// Product Types
export interface Product {
  id: string
  shop_id: string
  name: string
  description?: string
  sku: string
  category_id: string
  price: number
  cost: number
  stock: number
  unit: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  shop_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Transaction Types
export interface Transaction {
  id: string
  shop_id: string
  cashier_id: string
  customer_id?: string
  total: number
  tax: number
  discount: number
  payment_method: 'cash' | 'mobile_money' | 'card'
  payment_reference?: string
  status: 'pending' | 'completed' | 'cancelled' | 'synced'
  notes?: string
  synced_at?: string
  created_at: string
  updated_at: string
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  total: number
  created_at: string
}

// Customer Types
export interface Customer {
  id: string
  shop_id: string
  name: string
  phone: string
  email?: string
  credit_balance: number
  credit_limit: number
  address?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerTransaction {
  id: string
  customer_id: string
  transaction_id: string
  amount: number
  balance_after: number
  created_at: string
}

// Report Types
export interface DailySalesReport {
  date: string
  total_sales: number
  total_transactions: number
  cash_sales: number
  mobile_money_sales: number
  total_discount: number
  total_tax: number
  top_products: Array<{
    product_id: string
    name: string
    quantity: number
    revenue: number
  }>
}

export interface InventoryReport {
  product_id: string
  name: string
  sku: string
  current_stock: number
  sold_today: number
  sold_week: number
  cost: number
  revenue: number
  margin: number
}

// Offline Sync Types
export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  entity_id: string
  data: any
  timestamp: number
  synced: boolean
  error?: string
}

export interface SyncStatus {
  isSyncing: boolean
  lastSyncTime?: number
  pendingItems: number
  error?: string
}
