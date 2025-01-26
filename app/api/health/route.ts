
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkConnection } from '@/lib/utils';

export async function GET() {
  const isConnected = await checkConnection();
  
  if (!isConnected) {
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 503 });
  }

  return NextResponse.json({ status: 'ok', message: 'Database connected' });
}
