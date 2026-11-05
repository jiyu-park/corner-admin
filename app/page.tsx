'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ErrorBox, Notice } from '@/components/Feedback';
import { mins, STATUS_LABEL, todayKST } from '@/lib/format';

type Row = {
  id: number; reserved_date: string; start_time: string; end_time: string; people_count: number; status: string;
  checked_in_at: string | null; correction_reason: string | null; room_name: string; user_name: string;
  member_name: string | null; charged_minutes: number;
};

export default function Reservations() {
  const [date, setDate] = useState(todayKST());
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState<string>('');
  const [asOf, setAsOf] = useState('');
  const [nsResult, setNsResult] = useState<any>(null);
  const [correcting, setCorrecting] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      setRows(await api<Row[]>(`/admin/reservations?date=${date}`));
    } catch (e) {
      setError(e);
    }
  }, [date]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, okMsg?: (r: any) => string) => {
    setError(null);
    setNotice('');
    try {
      const r = await fn();
      setNotice(okMsg ? okMsg(r) : r?.message || '처리했어요.');
      await load();
      return r;
    } catch (e) {
      setError(e);
    }
  };

  const markNoShows = async () => {
    setNsResult(null);
    const r = await act(
      () => api('/admin/reservations/mark-no-shows', { method: 'POST', body: asOf ? { as_of: asOf } : undefined }),
      (r) => `노쇼 전환 ${r.changed}건 처리했어요.`,
    );
    if (r) setNsResult(r);
  };

  return (
    <>
      <h1>예약 현황</h1>
      <div className="toolbar"><div className="row">
        <label>날짜<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <button className="outline" onClick={load}>새로고침</button>
        <button className="primary" onClick={markNoShows}>노쇼 전환</button>
      </div>
      <details style={{ marginTop: 8, marginBottom: 0 }}>
        <summary>시연용 옵션: 기준 시각(as_of)</summary>
        <label style={{ maxWidth: 320, marginTop: 8 }}>
          이 시각이 &quot;지금&quot;이라고 가정 (비우면 실제 현재 시각)
          <input value={asOf} onChange={(e) => setAsOf(e.target.value)} placeholder="예: 2026-11-05T10:30:00" />
        </label>
      </details></div>
      <ErrorBox error={error} />
      <Notice>{notice}</Notice>
      {nsResult && (
        <div className="card">
          <strong>노쇼 전환 결과</strong> — 기준 시각 {String(nsResult.now)}, 변경 {nsResult.changed}건
          {nsResult.reservations?.length > 0 && (
            <ul className="plain">
              {nsResult.reservations.map((x: any) => (
                <li key={x.id}>예약 #{x.id}: 차감 {x.percent}%{x.first_violation ? ' (첫 위반)' : ''}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="table-wrap"><table style={{ minWidth: 880 }}>
        <thead>
          <tr><th>방</th><th>시간</th><th>예약자</th><th>소속 멤버</th><th className="num">인원</th><th>상태</th><th>차감 시간</th><th>정정 사유</th><th>동작</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={9} className="muted" style={{ textAlign: 'center', padding: 32 }}>이 날짜의 예약이 없어요.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.room_name}</td>
              <td>{r.start_time}~{r.end_time}</td>
              <td>{r.user_name}</td>
              <td>{r.member_name ?? '-'}</td>
              <td className="num">{r.people_count}</td>
              <td>
                <span className={`badge st-${r.status}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                {r.status === 'reserved' && r.checked_in_at && <div className="small muted">사용 중</div>}
              </td>
              <td>{mins(r.charged_minutes)}</td>
              <td>{r.correction_reason ?? ''}</td>
              <td>
                {r.status === 'reserved' && !r.checked_in_at && (
                  <button className="small" onClick={() => act(() => api(`/admin/reservations/${r.id}/check-in`, { method: 'POST' }))}>사용 시작</button>
                )}
                {r.status === 'reserved' && r.checked_in_at && (
                  <button className="small" onClick={() => act(() => api(`/admin/reservations/${r.id}/complete`, { method: 'POST' }), () => '사용 완료로 바꿨어요.')}>사용 완료</button>
                )}
                {(r.status === 'no_show' || r.status === 'cancelled') && (
                  correcting === r.id ? (
                    <div className="row" style={{ margin: 0 }}>
                      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="정정 사유" />
                      <button className="small primary" onClick={async () => {
                        const ok = await act(() => api(`/admin/reservations/${r.id}/correct`, { body: { reason } }));
                        if (ok) { setCorrecting(null); setReason(''); }
                      }}>확인</button>
                      <button className="small outline" onClick={() => setCorrecting(null)}>취소</button>
                    </div>
                  ) : (
                    <button className="small" onClick={() => { setCorrecting(r.id); setReason(''); }}>정정</button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
