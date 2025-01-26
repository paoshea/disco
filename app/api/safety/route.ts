
'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { safetyService } from '@/services/api/safety.service';

export async function GET(request: NextRequest) {
  try {
    const safetySettings = await safetyService.getSafetySettings();
    return NextResponse.json(safetySettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch safety settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const settings = await safetyService.updateSafetySettings(data);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update safety settings' },
      { status: 500 }
    );
  }
}
