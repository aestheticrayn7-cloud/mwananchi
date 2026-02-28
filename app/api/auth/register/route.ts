import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, storeName } = await request.json();

    // Validation
    if (!email || !password || !fullName || !storeName) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create store
    const storeId = uuidv4();
    const userId = uuidv4();

    const { error: storeError } = await supabase
      .from('stores')
      .insert({
        id: storeId,
        name: storeName,
        owner_id: userId,
      });

    if (storeError) {
      console.error('[v0] Store creation error:', storeError);
      return NextResponse.json(
        { message: 'Failed to create store' },
        { status: 500 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        store_id: storeId,
        email,
        full_name: fullName,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
      });

    if (userError) {
      console.error('[v0] User creation error:', userError);
      return NextResponse.json(
        { message: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Generate token
    const token = generateToken({
      userId,
      email,
      role: 'admin',
      storeId,
    });

    const response = {
      user: {
        id: userId,
        email,
        fullName,
        role: 'admin',
        storeId,
        token,
      },
      store: {
        id: storeId,
        name: storeName,
        location: null,
        phone: null,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
