import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        storeId: payload.storeId,
      },
    });
  } catch (error: any) {
    console.error('[v0] Verification error:', error);
    return NextResponse.json(
      { message: 'Token verification failed' },
      { status: 401 }
    );
  }
}
