import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const meta = () => ({
  timestamp: new Date().toISOString(),
  version: '1.0.0',
});

export function success(data: unknown = null, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: meta(),
    },
    { status },
  );
}

export function failure(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
      meta: meta(),
    },
    { status },
  );
}

export function handleRouteError(err: unknown) {
  // Log server-side for debugging while still returning a structured response
  console.error('Route error:', err);

  if (err instanceof ZodError) {
    return failure(400, 'VALIDATION_ERROR', 'Validation failed', err.issues);
  }

  if (err instanceof Error) {
    return failure(500, 'INTERNAL_SERVER_ERROR', err.message || 'An error occurred', {
      stack: err.stack,
    });
  }

  // Supabase/PostgREST errors and other non-Error objects
  if (err && typeof err === 'object') {
    const message = (err as any).message || 'An error occurred';
    return failure(500, 'INTERNAL_SERVER_ERROR', message, err);
  }

  return failure(500, 'INTERNAL_SERVER_ERROR', 'An error occurred');
}
