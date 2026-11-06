'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ErrorBox, Notice } from '@/components/Feedback';
import { todayKST, ymd } from '@/lib/format';

export default function Seats() {
  const [seats, setSeats] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [seatId, setSeatId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [start, setStart] = useState(todayKST());
  const [end, setEnd] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([api('/admin/seats'), api('/admin/members')]);
      setSeats(s); setMembers(m);
    } catch (e) { setError(e); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setNotice('');
    try {
      await api(`/admin/seats/${seatId || 0}/assign`, { body: { member_id: memberId || undefined, start_date: start, end_date: end || null } });
      setNotice('자리를 배정했어요.');
      await load();
    } catch (err) { setError(err); }
  };

  return (
    <>
      <h1>고정석</h1>
      <form className="card row" onSubmit={assign}>
        <label>자리
          <select value={seatId} onChange={(e) => setSeatId(e.target.value)}>
            <option value="">선택…</option>
            {seats.map((s) => <option key={s.id} value={s.id}>{s.seat_no}</option>)}
          </select>
        </label>
        <label>멤버
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">선택…</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label>시작일<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>종료일(비우면 계속)<input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <button className="primary">배정</button>
      </form>
      <ErrorBox error={error} />
      <Notice>{notice}</Notice>
      <div className="table-wrap"><table>
        <thead><tr><th>자리</th><th>현재 배정 멤버</th><th>기간</th></tr></thead>
        <tbody>
          {seats.map((s) => (
            <tr key={s.id}>
              <td>{s.seat_no}</td>
              <td>{s.member_name ?? <span className="muted">비어 있음</span>}</td>
              <td>{s.assignment_id ? `${ymd(s.start_date)} ~ ${s.end_date ? ymd(s.end_date) : '계속'}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
