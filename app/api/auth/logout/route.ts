import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Clear any server-side session if needed
    // For now, client handles logout via localStorage
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
