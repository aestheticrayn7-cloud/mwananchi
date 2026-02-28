import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { productsService } from '@/lib/products-service';
import { useAuth } from './use-auth';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!user?.token) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const data = await productsService.getProducts(user.token);
      setProducts(data);
    } catch (err: any) {
      console.error('[v0] Error loading products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.token]);

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.token) throw new Error('Not authenticated');
    
    try {
      const newProduct = await productsService.createProduct(product, user.token);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user?.token) throw new Error('Not authenticated');
    
    try {
      const updated = await productsService.updateProduct(id, updates, user.token);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user?.token) throw new Error('Not authenticated');
    
    try {
      await productsService.deleteProduct(id, user.token);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: loadProducts,
  };
}
