import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// GET all products for store
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', payload.storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching products:', error);
      return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('[v0] Error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, sku, price, category_id, description, cost_price, reorder_level } = body;

    // Validation
    if (!name || !sku || !price) {
      return NextResponse.json(
        { message: 'Name, SKU, and price are required' },
        { status: 400 }
      );
    }

    const productId = uuidv4();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        id: productId,
        store_id: payload.storeId,
        name,
        sku,
        price: parseFloat(price),
        category_id,
        description,
        cost_price: cost_price ? parseFloat(cost_price) : null,
        reorder_level: reorder_level || 10,
        quantity_in_stock: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Error creating product:', error);
      return NextResponse.json(
        { message: error.message || 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('[v0] Error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
