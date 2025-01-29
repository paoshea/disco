import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export async function GET(): Promise<NextResponse> {
  const isConnected = await checkConnection();

  if (isConnected) {
    return NextResponse.json({ status: 'ok' });
  } else {
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 500 });
  }
}
