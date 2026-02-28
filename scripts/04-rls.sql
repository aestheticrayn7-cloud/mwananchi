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
