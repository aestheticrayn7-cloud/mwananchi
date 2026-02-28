import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d)
}

export function calculateTax(amount: number, taxRate: number = 0.16): number {
  return Math.round(amount * taxRate * 100) / 100
}

export function calculateProfit(selling: number, cost: number): number {
  return selling - cost
}

export function calculateMarginPercent(selling: number, cost: number): number {
  if (cost === 0) return 0
  return Math.round(((selling - cost) / selling) * 100 * 100) / 100
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

// Authentication functions
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const ALGORITHM = 'HS256';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  storeId: string;
  iat?: number;
  exp?: number;
}

// Simple JWT implementation for demo (use jsonwebtoken in production)
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const header = { alg: ALGORITHM, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  const encoded = {
    header: base64Encode(JSON.stringify(header)),
    payload: base64Encode(JSON.stringify(tokenPayload)),
  };

  const signature = base64Encode(
    hmacSha256(`${encoded.header}.${encoded.payload}`, JWT_SECRET)
  );

  return `${encoded.header}.${encoded.payload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }

    const payload = JSON.parse(base64Decode(payloadB64)) as TokenPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify signature
    const expectedSignature = base64Encode(
      hmacSha256(`${headerB64}.${payloadB64}`, JWT_SECRET)
    );

    if (signatureB64 !== expectedSignature) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[v0] Token verification failed:', error);
    return null;
  }
}

// Password hashing (bcrypt-like for demo, use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// Helper functions for JWT
function base64Encode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64Decode(str: string): string {
  let s = str.replace(/\-/g, '+').replace(/_/g, '/');
  switch (s.length % 4) {
    case 0:
      break;
    case 2:
      s += '==';
      break;
    case 3:
      s += '=';
      break;
    default:
      throw new Error('Invalid base64');
  }
  return atob(s);
}

function hmacSha256(message: string, secret: string): string {
  // Simple HMAC-SHA256 implementation for demo
  // In production, use crypto.subtle or a library
  const encoder = new TextEncoder();
  return secret + message; // Placeholder - use proper HMAC in production
}
