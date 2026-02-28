import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken, verifyPassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, storeName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: userRecords, error: userError } = await supabase
      .from('users')
      .select('*, stores(*)')
      .eq('email', email)
      .single();

    if (userError || !userRecords) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, userRecords.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!userRecords.is_active) {
      return NextResponse.json(
        { message: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userRecords.id);

    // Generate token
    const token = generateToken({
      userId: userRecords.id,
      email: userRecords.email,
      role: userRecords.role,
      storeId: userRecords.store_id,
    });

    const response = {
      user: {
        id: userRecords.id,
        email: userRecords.email,
        fullName: userRecords.full_name,
        role: userRecords.role,
        storeId: userRecords.store_id,
        token,
      },
      store: {
        id: userRecords.stores.id,
        name: userRecords.stores.name,
        location: userRecords.stores.location,
        phone: userRecords.stores.phone,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
