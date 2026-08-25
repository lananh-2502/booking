'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Participant = { personName: string; avatar: number; slots: string[] };
type Group = { id: number; name: string; memberCount: number; submittedCount: number; status: 'open' | 'finalized'; finalSlots: string[]; participants?: Participant[] };
type Mode = 'home' | 'create' | 'join' | 'schedule' | 'result';
const TIMES = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
const AVATAR_NAMES = ['Vàng hí hửng', 'Xanh vui vẻ', 'Hồng mít ướt', 'Xanh trái tim', 'Cam tò mò', 'Tím hơi buồn'];

function nextDays(weekOffset: number) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1 + weekOffset * 7);
    return { key: d.toISOString().slice(0, 10), weekday: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(d), day: d.getDate(), month: d.getMonth() + 1 };
  });
}

export default function Home() {
  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => nextDays(weekOffset), [weekOffset]);
  const [mode, setMode] = useState<Mode>('home');
  const [groups, setGroups] = useState<Group[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [memberCount, setMemberCount] = useState(4);
  const [personName, setPersonName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [avatar, setAvatar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const loadGroups = async () => { const r = await fetch('/api/groups', { cache: 'no-store' }); if (r.ok) setGroups(await r.json()); };
  const loadGroup = async (id: number) => { const r = await fetch(`/api/groups/${id}/availability`, { cache: 'no-store' }); if (r.ok) setGroup(await r.json()); };
  useEffect(() => { loadGroups(); }, []);
  useEffect(() => {
    if (mode !== 'schedule' || !group) return;
    loadGroup(group.id); const timer = setInterval(() => loadGroup(group.id), 5000);
    return () => clearInterval(timer);
  }, [mode, group?.id]);

  const createGroup = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setNotice('');
    const r = await fetch('/api/groups', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: groupName, memberCount }) });
    const d = await r.json(); setLoading(false);
    if (!r.ok) return setNotice(d.error || 'Chưa thể tạo nhóm.');
    setGroup(d); setMode('schedule');
  };
  const joinGroup = (e: FormEvent) => {
    e.preventDefault(); const found = groups.find(g => String(g.id) === selectedGroupId);
    if (!found) return setNotice('Chọn một nhóm đi m.');
    const used = new Set(found.participants?.map(p => p.avatar) || []);
    if (used.has(avatar)) setAvatar([0, 1, 2, 3, 4, 5].find(a => !used.has(a)) ?? avatar);
    setGroup(found); setMode(found.status === 'finalized' ? 'result' : 'schedule');
  };
  const toggleSlot = (slot: string) => setSelected(v => v.includes(slot) ? v.filter(s => s !== slot) : [...v, slot]);
  const submitAvailability = async () => {
    if (!group || !personName.trim() || !selected.length) return setNotice('Nhập tên và chọn ít nhất một khung giờ nhé.');
    setLoading(true); setNotice('');
    const r = await fetch(`/api/groups/${group.id}/availability`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ personName, avatar, slots: selected }) });
    const d = await r.json(); setLoading(false);
    if (!r.ok) return setNotice(d.error || 'Chưa thể lưu lịch.');
    setGroup(d); await loadGroups(); setMode('result');
  };
  const reset = () => { setMode('home'); setGroup(null); setPersonName(''); setSelected([]); setAvatar(0); setWeekOffset(0); setNotice(''); loadGroups(); };

  return <main>
    <div className="floating-mascots" aria-hidden="true"><AvatarSticker avatar={0}/><AvatarSticker avatar={2}/><AvatarSticker avatar={3}/><AvatarSticker avatar={4}/><AvatarSticker avatar={5}/></div>
    <nav className="nav"><button className="brand" onClick={reset}><AvatarSticker avatar={1}/> Hẹn nha!</button><div className="nav-note"><i/>Rảnh lúc nào, chốt lúc đó</div></nav>
    <section className="shell"><header className="page-heading"><h1>Chốt lịch lẹ lên!!!</h1><p><span>1</span> Tạo nhóm <b>→</b><span>2</span> Chọn lịch rảnh <b>→</b><span>3</span> Chờ đủ người <b>→</b><span>4</span> Chốt kèo ✨</p></header>
      <div className="card">
        {mode === 'home' && <><div className="card-head"><span className="icon lavender">☻</span><div><p>BẮT ĐẦU THÔI</p><h2>M là người...</h2></div></div><button className="choice peach" onClick={() => setMode('create')}><span className="choice-icon">＋</span><div><b>Tạo nhóm mới</b><small>Đặt tên nhóm và số thành viên</small></div><strong>›</strong></button><div className="or"><span/>hoặc<span/></div><button className="choice mint" onClick={() => { setMode('join'); loadGroups(); }}><span className="choice-icon">⌁</span><div><b>Tham gia nhóm</b><small>Chọn nhóm đã có trong danh sách</small></div><strong>›</strong></button><p className="privacy">♧ Không cần tài khoản · Ai cũng vào được</p></>}
        {mode === 'create' && <form onSubmit={createGroup}><Back onClick={() => setMode('home')}/><div className="card-head"><span className="icon peach-bg">＋</span><div><p>TẠO CUỘC HẸN</p><h2>Nhóm m tên gì?</h2></div></div><label>Tên nhóm<input autoFocus required maxLength={40} placeholder="Ví dụ: Lan Anh và những người bạn" value={groupName} onChange={e => setGroupName(e.target.value)}/></label><label>Số thành viên<div className="counter"><button type="button" onClick={() => setMemberCount(Math.max(2, memberCount - 1))}>−</button><b>{memberCount}</b><button type="button" onClick={() => setMemberCount(Math.min(6, memberCount + 1))}>＋</button></div></label><label>Tên của m<input required maxLength={30} placeholder="M tên gì?" value={personName} onChange={e => setPersonName(e.target.value)}/></label><AvatarPicker value={avatar} onChange={setAvatar}/>{notice && <p className="notice">{notice}</p>}<button className="primary" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo nhóm & chọn lịch →'}</button></form>}
        {mode === 'join' && <form onSubmit={joinGroup}><Back onClick={() => setMode('home')}/><div className="card-head"><span className="icon mint-bg">⌁</span><div><p>THAM GIA CUỘC HẸN</p><h2>Chọn nhóm của m</h2></div></div><label>Nhóm đang mở<select required value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}><option value="">— Chọn một nhóm —</option>{groups.filter(g => g.status === 'open').map(g => <option key={g.id} value={g.id}>{g.name} · {g.submittedCount}/{g.memberCount} người</option>)}</select></label>{!groups.some(g => g.status === 'open') && <p className="empty">Chưa có nhóm nào đang mở. M tạo nhóm mới đi!</p>}<label>Tên của m<input required maxLength={30} placeholder="M tên gì?" value={personName} onChange={e => setPersonName(e.target.value)}/></label><AvatarPicker value={avatar} onChange={setAvatar} usedAvatars={groups.find(g => String(g.id) === selectedGroupId)?.participants?.map(p => p.avatar) || []}/>{notice && <p className="notice">{notice}</p>}<button className="primary">Tiếp tục chọn lịch →</button></form>}
        {mode === 'schedule' && group && <><Back onClick={reset}/><div className="schedule-title"><div><p>NHÓM</p><h2>{group.name}</h2></div><span>{group.submittedCount}/{group.memberCount} người đã chọn</span></div><p className="hint">Ê <b>{personName}</b>! Chạm hết mấy khung giờ m rảnh đi.</p><div className="participant-legend">{group.participants?.length ? group.participants.map(p => <span key={p.personName}><AvatarSticker avatar={p.avatar}/><b>{p.personName}</b></span>) : <small>Chưa ai gửi lịch — m mở hàng đi!</small>}</div><div className="week-nav"><button type="button" disabled={weekOffset === 0} onClick={() => setWeekOffset(v => Math.max(0, v - 1))}>‹</button><b>{weekOffset === 0 ? 'Tuần này' : `Tuần +${weekOffset}`}</b><button type="button" onClick={() => setWeekOffset(v => v + 1)}>›</button></div><div className="calendar"><div className="time-label">Giờ</div>{days.map(d => <div className="day" key={d.key}><small>{d.weekday}</small><b>{d.day}</b><small>thg {d.month}</small></div>)}{TIMES.flatMap(time => [<div className="time" key={time}>{time}</div>, ...days.map(d => { const slot = `${d.key}T${time}`; const free = group.participants?.filter(p => p.slots.includes(slot)) || []; return <button type="button" aria-label={`${d.key} ${time}`} key={slot} onClick={() => toggleSlot(slot)} className={selected.includes(slot) ? 'slot selected' : 'slot'}><span className="slot-avatars">{free.map(p => <AvatarSticker key={p.personName} avatar={p.avatar}/>)}</span>{selected.includes(slot) && <i>✓</i>}</button>; })])}</div>{notice && <p className="notice">{notice}</p>}<div className="submit-row"><span>Đã chọn <b>{selected.length}</b> khung giờ</span><button className="primary compact" disabled={loading} onClick={submitAvailability}>{loading ? 'Đang lưu...' : 'Xong, lưu lịch →'}</button></div></>}
        {mode === 'result' && group && <><Back onClick={reset}/><div className="result-icon">{group.status === 'finalized' ? '🎉' : '✓'}</div><p className="result-kicker">{group.status === 'finalized' ? 'CHỐT KÈO THÀNH CÔNG' : 'ĐÃ LƯU LỊCH CỦA M'}</p><h2 className="result-title">{group.name}</h2>{group.status === 'finalized' ? <><p className="result-copy">Tất cả đã trả lời! Khung giờ hợp nhau nhất là:</p><div className="final-slots">{group.finalSlots.length ? group.finalSlots.map(s => <div key={s}><b>{new Date(s).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</b><span>{s.slice(11, 16)}</span></div>) : <p>Chưa có khung giờ nào tất cả cùng rảnh. Cả nhóm thử trao đổi thêm nhé.</p>}</div></> : <><p className="result-copy">Còn <b>{group.memberCount - group.submittedCount} người</b> nữa. Khi đủ thành viên, lịch chung sẽ tự động được chốt.</p><div className="progress"><i style={{ width: `${group.submittedCount / group.memberCount * 100}%` }}/></div><small className="waiting">{group.submittedCount}/{group.memberCount} người đã hoàn thành</small></>}<button className="secondary" onClick={reset}>Về trang chính</button></>}
      </div>
    </section><footer>Made for những cuộc hẹn không bị “để tính sau” ♡</footer>
  </main>;
}

function AvatarPicker({ value, onChange, usedAvatars = [] }: { value: number; onChange: (value: number) => void; usedAvatars?: number[] }) { return <fieldset className="avatar-picker"><legend>Chọn avatar của m</legend><div>{AVATAR_NAMES.map((name, index) => { const used = usedAvatars.includes(index); return <button type="button" disabled={used} className={value === index ? 'active' : ''} aria-label={used ? `${name} — đã có người chọn` : name} aria-pressed={value === index} key={name} onClick={() => onChange(index)}><AvatarSticker avatar={index}/>{used && <i>Đã chọn</i>}</button>; })}</div><small>{usedAvatars.includes(value) ? 'Mascot này đã có người chọn — chọn con khác nhé!' : AVATAR_NAMES[value]}</small></fieldset>; }
function AvatarSticker({ avatar }: { avatar: number }) { const col = avatar % 3, row = Math.floor(avatar / 3); return <span className="avatar-sticker" style={{ backgroundPosition: `${col * 50}% ${row * 100}%` }}/>; }
function Back({ onClick }: { onClick: () => void }) { return <button type="button" className="back" onClick={onClick}>← Quay lại</button>; }
