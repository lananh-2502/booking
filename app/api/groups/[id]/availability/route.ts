import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

async function getGroup(groupId: number) {
  const group = await env.DB.prepare('SELECT * FROM groups WHERE id = ?').bind(groupId).first<any>();
  if (!group) return null;
  const { results } = await env.DB.prepare('SELECT person_name, avatar, slots FROM responses WHERE group_id = ? ORDER BY id').bind(groupId).all<any>();
  const participants = results.map(r => ({ personName: r.person_name, avatar: Number(r.avatar || 0), slots: JSON.parse(r.slots) as string[] }));
  const all = participants.map(p => p.slots), finalized = all.length >= group.member_count;
  const finalSlots = finalized && all.length ? all.reduce((a, b) => a.filter(x => b.includes(x))) : [];
  return { id: group.id, name: group.name, memberCount: group.member_count, submittedCount: all.length, status: finalized ? 'finalized' : 'open', finalSlots, participants };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const data = await getGroup(Number(id));
  return data ? NextResponse.json(data) : NextResponse.json({ error: 'Không tìm thấy nhóm.' }, { status: 404 });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, groupId = Number(id);
  const body = await request.json() as { personName?: string; avatar?: number; slots?: string[] };
  const personName = body.personName?.trim(), avatar = Number(body.avatar), slots = [...new Set(body.slots || [])];
  if (!personName || !slots.length || !Number.isInteger(avatar) || avatar < 0 || avatar > 5) return NextResponse.json({ error: 'Tên, avatar và lịch rảnh là bắt buộc.' }, { status: 400 });
  const group = await env.DB.prepare('SELECT * FROM groups WHERE id = ?').bind(groupId).first<any>();
  if (!group) return NextResponse.json({ error: 'Không tìm thấy nhóm.' }, { status: 404 });
  const existing = await env.DB.prepare('SELECT COUNT(*) AS count FROM responses WHERE group_id = ?').bind(groupId).first<any>();
  if (Number(existing.count) >= group.member_count) return NextResponse.json({ error: 'Nhóm này đã đủ thành viên.' }, { status: 409 });
  const duplicate = await env.DB.prepare('SELECT id FROM responses WHERE group_id = ? AND lower(person_name) = lower(?)').bind(groupId, personName).first();
  if (duplicate) return NextResponse.json({ error: 'Tên này đã gửi lịch trong nhóm rồi.' }, { status: 409 });
  const avatarTaken = await env.DB.prepare('SELECT person_name FROM responses WHERE group_id = ? AND avatar = ?').bind(groupId, avatar).first<any>();
  if (avatarTaken) return NextResponse.json({ error: `Mascot này đã được ${avatarTaken.person_name} chọn rồi. M chọn con khác nhé!` }, { status: 409 });
  const inserted = await env.DB.prepare('INSERT INTO responses (group_id, person_name, avatar, slots, created_at) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM responses WHERE group_id = ? AND avatar = ?)').bind(groupId, personName, avatar, JSON.stringify(slots), new Date().toISOString(), groupId, avatar).run();
  if (!inserted.meta.changes) return NextResponse.json({ error: 'Mascot này vừa có người chọn mất rồi. M chọn con khác nhé!' }, { status: 409 });
  return NextResponse.json(await getGroup(groupId));
}
