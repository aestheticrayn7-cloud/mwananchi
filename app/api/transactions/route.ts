import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

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

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .eq('store_id', payload.storeId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[v0] Error fetching transactions:', error);
      return NextResponse.json({ message: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('[v0] Error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}

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
    const {
      items,
      subtotal,
      discount_amount,
      tax_amount,
      net_amount,
      payment_method,
      customer_id,
    } = body;

    const transactionId = uuidv4();

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        store_id: payload.storeId,
        user_id: payload.userId,
        customer_id,
        total_amount: subtotal,
        discount_amount,
        tax_amount,
        net_amount,
        payment_method,
        status: 'completed',
      })
      .select()
      .single();

    if (txError) {
      console.error('[v0] Error creating transaction:', txError);
      return NextResponse.json(
        { message: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Create transaction items
    const itemInserts = items.map((item: any) => ({
      id: uuidv4(),
      transaction_id: transactionId,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      discount_amount: item.discount || 0,
      line_total: item.product.price * item.quantity - (item.discount || 0),
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemInserts);

    if (itemsError) {
      console.error('[v0] Error creating transaction items:', itemsError);
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: uuidv4(),
        store_id: payload.storeId,
        transaction_id: transactionId,
        customer_id,
        amount: net_amount,
        payment_method,
        status: 'completed',
      });

    if (paymentError) {
      console.error('[v0] Error creating payment:', paymentError);
    }

    // Update product stock (decrease quantity)
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('quantity_in_stock')
        .eq('id', item.product.id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({
            quantity_in_stock: Math.max(0, product.quantity_in_stock - item.quantity),
          })
          .eq('id', item.product.id);
      }
    }

    return NextResponse.json(
      { transaction, items: itemInserts },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
