-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
  store_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  email TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code TEXT DEFAULT 'KES',
  timezone TEXT DEFAULT 'Africa/Nairobi',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add store_id constraint to users
ALTER TABLE users ADD CONSTRAINT users_store_id_fkey 
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, name)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  barcode TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, sku)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  credit_used DECIMAL(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES users(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  transaction_number TEXT NOT NULL,
  transaction_type TEXT DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'return')),
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'credit')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  is_synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, transaction_number)
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'credit')),
  reference_number TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync queue table (for offline-first tracking)
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  payload JSONB NOT NULL,
  is_synced BOOLEAN DEFAULT false,
  sync_attempts INT DEFAULT 0,
  last_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_sync_queue_store_id ON sync_queue(store_id);
CREATE INDEX idx_sync_queue_is_synced ON sync_queue(is_synced);

-- Enable Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view their own store" ON stores
  FOR SELECT USING (id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Store owner can update store" ON stores
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for users
CREATE POLICY "Users can view users in their store" ON users
  FOR SELECT USING (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for categories
CREATE POLICY "Users can view categories in their store" ON categories
  FOR SELECT USING (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Managers and admins can manage categories" ON categories
  FOR INSERT WITH CHECK (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- RLS Policies for products
CREATE POLICY "Users can view products in their store" ON products
  FOR SELECT USING (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Managers and admins can manage products" ON products
  FOR INSERT WITH CHECK (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- RLS Policies for customers
CREATE POLICY "Users can view customers in their store" ON customers
  FOR SELECT USING (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage customers in their store" ON customers
  FOR INSERT WITH CHECK (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions in their store" ON transactions
  FOR SELECT USING (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Cashiers can create transactions" ON transactions
  FOR INSERT WITH CHECK (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ) AND cashier_id = auth.uid());

-- RLS Policies for transaction_items
CREATE POLICY "Users can view transaction items in their store" ON transaction_items
  FOR SELECT USING (transaction_id IN (
    SELECT id FROM transactions WHERE store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    )
  ));

-- RLS Policies for payments
CREATE POLICY "Users can view payments in their store" ON payments
  FOR SELECT USING (transaction_id IN (
    SELECT id FROM transactions WHERE store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    )
  ));

-- RLS Policies for sync_queue
CREATE POLICY "Users can view sync queue for their store" ON sync_queue
  FOR SELECT USING (store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
