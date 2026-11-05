'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ErrorBox } from '@/components/Feedback';
import { mins, monthKST, ymd } from '@/lib/format';

export default function Reports() {
  const [month, setMonth] = useState(monthKST());
  const [ending, setEnding] = useState<any[]>([]);
  const [util, setUtil] = useState<any>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setError(null);
    Promise.all([api(`/admin/memberships/ending?month=${month}`), api(`/admin/rooms/utilization?month=${month}`)])
      .then(([e, u]) => { setEnding(e); setUtil(u); })
      .catch(setError);
  }, [month]);

  return (
    <>
      <h1>현황</h1>
      <div className="toolbar"><div className="row"><label>월<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label></div></div>
      <ErrorBox error={error} />
      <h2>종료 예정 멤버십</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>멤버</th><th>멤버십</th><th>종료일</th></tr></thead>
        <tbody>
          {ending.length === 0 && <tr><td colSpan={3} className="muted" style={{ textAlign: 'center', padding: 24 }}>이 달에 종료 예정인 멤버가 없어요.</td></tr>}
          {ending.map((r, i) => <tr key={i}><td>{r.member_name}</td><td>{r.plan_name}</td><td>{ymd(r.end_date)}</td></tr>)}
        </tbody>
      </table></div>
      <h2>회의실 이용률</h2>
      {util && (
        <>
          <p className="muted small">이용률 = 예약된 시간(취소 제외) ÷ 이용 가능 시간. 이용 가능 시간은 한 방당 {util.available_minutes}분({mins(util.available_minutes)}) = 그 달 일수 × 하루 14시간(08:00~22:00).</p>
          <div className="table-wrap"><table>
            <thead><tr><th>회의실</th><th>예약 시간</th><th className="num">이용률</th><th style={{ width: '40%' }}></th></tr></thead>
            <tbody>
              {util.rooms.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.name}</td><td>{mins(r.booked_minutes)}</td><td className="num"><strong>{r.rate}%</strong></td>
                  <td><div className="bar" role="img" aria-label={`이용률 ${r.rate}%`}><div style={{ width: `${Math.min(100, r.rate)}%` }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </>
  );
}
