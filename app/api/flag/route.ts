import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { disposalEventId?: string; reason?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.disposalEventId) {
    return NextResponse.json({ error: 'disposalEventId required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify the disposal event belongs to this user
  const { data: event, error: eventError } = await admin
    .from('disposal_events')
    .select('id, flagged')
    .eq('id', body.disposalEventId)
    .eq('user_id', user.id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: 'Disposal event not found' }, { status: 404 });
  }

  // Check for duplicate flag
  const { count } = await admin
    .from('flags')
    .select('id', { count: 'exact', head: true })
    .eq('disposal_event_id', body.disposalEventId)
    .eq('user_id', user.id);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "You've already flagged this item." }, { status: 409 });
  }

  // Insert flag record
  const { error: flagError } = await admin.from('flags').insert({
    disposal_event_id: body.disposalEventId,
    user_id: user.id,
    reason: body.reason ?? null,
    status: 'pending',
  });

  if (flagError) {
    return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 });
  }

  // Mark disposal event as flagged (Req 2.4 — suspends trust score penalty)
  await admin
    .from('disposal_events')
    .update({ flagged: true })
    .eq('id', body.disposalEventId);

  return NextResponse.json({ success: true });
}
