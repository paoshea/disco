'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import type { SafetyAlert } from '@prisma/client';
import { z } from 'zod';

const ActionSchema = z.object({
 action: z.enum(['dismiss', 'resolve']),
});

type RouteParams = {
 params: {
   id: string;
 };
 searchParams: { [key: string]: string | string[] | undefined };
};

async function validateRequest() {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
   throw new Error('Unauthorized');
 }
 return session.user.id;
}

export async function GET(
 request: NextRequest,
 params: RouteParams
): Promise<NextResponse<SafetyAlert | { error: string }>> {
 try {
   const userId = await validateRequest();
   const alert = await safetyService.getSafetyAlert(params.params.id);

   if (!alert) {
     return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
   }

   if (alert.userId !== userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
   }

   return NextResponse.json(alert);
 } catch (error: Error | unknown) {
   const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
   return NextResponse.json({ error: errorMessage }, { status: 400 });
 }
}

export async function PUT(
 request: NextRequest,
 params: RouteParams
): Promise<NextResponse<SafetyAlert | { error: string; details?: unknown }>> {
 try {
   const userId = await validateRequest();
   const body = await request.json();
   const result = ActionSchema.safeParse(body);

   if (!result.success) {
     return NextResponse.json(
       { error: 'Invalid input', details: result.error },
       { status: 400 }
     );
   }

   const { action } = result.data;
   const updatedAlert = action === 'dismiss'
     ? await safetyService.dismissAlert(params.params.id, userId)
     : await safetyService.resolveAlert(params.params.id, userId);

   return NextResponse.json(updatedAlert);
 } catch (error: Error | unknown) {
   const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
   return NextResponse.json({ error: errorMessage }, { status: 400 });
 }
}