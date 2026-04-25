import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  return profile?.is_admin ? user : null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const user = await requireAdmin(supabase);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data: flags } = await admin
    .from('flags')
    .select('*, disposal_events(ai_classification, item_description, selected_bin), user_profiles(email, display_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return NextResponse.json(flags ?? []);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const user = await requireAdmin(supabase);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { flagId?: string; resolution?: 'resolved_valid' | 'resolved_invalid'; adminNote?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.flagId || !body.resolution) {
    return NextResponse.json({ error: 'flagId and resolution required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Resolve the flag
  const { data: flag, error: flagError } = await admin
    .from('flags')
    .update({
      status: body.resolution,
      admin_note: body.adminNote ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', body.flagId)
    .select('user_id')
    .single();

  if (flagError || !flag) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  // If resolved as invalid (flag was wrong), clear flag_active on the user
  if (body.resolution === 'resolved_invalid') {
    // Check if user has any remaining pending flags
    const { count } = await admin
      .from('flags')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', flag.user_id)
      .eq('status', 'pending');

    if ((count ?? 0) === 0) {
      await admin
        .from('user_profiles')
        .update({ flag_active: false })
        .eq('id', flag.user_id);
    }
  }

  return NextResponse.json({ success: true });
}
