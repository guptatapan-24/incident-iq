import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = typeof process.env.GROQ_API_KEY === 'string' && process.env.GROQ_API_KEY.trim().length > 0;
  return NextResponse.json({ configured: isConfigured });
}
