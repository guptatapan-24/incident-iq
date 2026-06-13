import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/stats
export async function GET(request: NextRequest) {
  try {
    // Fetch total count
    const { count: total, error: errTotal } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true });

    if (errTotal) throw errTotal;

    // Fetch open status count
    const { count: open, error: errOpen } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Open');

    if (errOpen) throw errOpen;

    // Fetch critical severity count
    const { count: critical, error: errCritical } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'Critical');

    if (errCritical) throw errCritical;

    // Fetch resolved status count
    const { count: resolved, error: errResolved } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Resolved');

    if (errResolved) throw errResolved;

    return NextResponse.json({
      total: total || 0,
      open: open || 0,
      critical: critical || 0,
      resolved: resolved || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
