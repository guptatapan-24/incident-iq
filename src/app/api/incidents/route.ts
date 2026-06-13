import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/incidents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase.from('incidents').select('*');

    if (category) {
      query = query.eq('category', category);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,store_location.ilike.%${search}%`);
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/incidents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, store_location, severity, reported_by, ai_summary, occurred_at, image_url } = body;

    if (!title || !description || !category || !store_location || !severity || !occurred_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert([
        {
          title,
          description,
          category,
          store_location,
          severity,
          reported_by,
          ai_summary,
          occurred_at,
          image_url,
          status: 'Open', // default status
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create database notification for the new incident
    let notifType = 'info';
    if (severity === 'Critical') notifType = 'error';
    else if (severity === 'High') notifType = 'warning';

    try {
      await supabase.from('notifications').insert([
        {
          title: `New Incident: ${title}`,
          message: `${severity} incident reported at ${store_location} (${category}).`,
          type: notifType,
          read: false,
        },
      ]);
    } catch (notifErr) {
      // Fail silently to not block main operation
      console.error('Failed to create notification:', notifErr);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
