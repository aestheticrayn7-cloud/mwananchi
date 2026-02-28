import { supabase } from './supabase';
import { indexedDB } from './indexeddb';
import { offlineSync } from './offline-sync';
import { Product } from './types';

class ProductsService {
  async getProducts(token: string, useCache: boolean = true): Promise<Product[]> {
    try {
      // Try to fetch from server first
      const response = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const { products } = await response.json();
        
        // Cache products locally
        for (const product of products) {
          await indexedDB.set('products', product);
        }

        return products;
      }
    } catch (error) {
      console.log('[v0] Failed to fetch from server, trying cache');
    }

    // Fall back to cached products
    if (useCache) {
      return await indexedDB.getAll('products');
    }

    return [];
  }

  async getProduct(id: string, token: string): Promise<Product | null> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const { product } = await response.json();
        await indexedDB.set('products', product);
        return product;
      }
    } catch (error) {
      console.log('[v0] Failed to fetch product from server, trying cache');
    }

    return await indexedDB.get('products', id);
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>, token: string): Promise<Product> {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    const { product: newProduct } = await response.json();
    
    // Cache and sync
    await indexedDB.set('products', newProduct);
    await offlineSync.addToSyncQueue({
      operation_type: 'CREATE',
      table_name: 'products',
      record_id: newProduct.id,
      data: newProduct,
    });

    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>, token: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    const { product } = await response.json();
    
    // Cache and sync
    await indexedDB.set('products', product);
    await offlineSync.addToSyncQueue({
      operation_type: 'UPDATE',
      table_name: 'products',
      record_id: id,
      data: updates,
    });

    return product;
  }

  async deleteProduct(id: string, token: string): Promise<void> {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    // Remove from cache and add to sync queue
    await indexedDB.delete('products', id);
    await offlineSync.addToSyncQueue({
      operation_type: 'DELETE',
      table_name: 'products',
      record_id: id,
      data: { id },
    });
  }
}

export const productsService = new ProductsService();
