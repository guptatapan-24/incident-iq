import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/incidents/[id]
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('incidents')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create database notification for status change
    try {
      await supabase.from('notifications').insert([
        {
          title: `Status Updated: ${data.title}`,
          message: `Status changed to "${status}".`,
          type: status === 'Resolved' || status === 'Closed' ? 'success' : 'info',
          read: false,
        },
      ]);
    } catch (notifErr) {
      // Fail silently to not block main operation
      console.error('Failed to create status notification:', notifErr);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/incidents/[id]
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;

    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
