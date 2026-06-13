import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/notifications
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    let query = supabase.from('notifications').update({ read: true });

    if (id) {
      // Mark specific notification as read
      query = query.eq('id', id);
    } else {
      // Mark all as read
      query = query.eq('read', false);
    }

    const { data, error } = await query.select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
