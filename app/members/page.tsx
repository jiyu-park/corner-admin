'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ErrorBox, Notice } from '@/components/Feedback';
import { mins, won, ymd } from '@/lib/format';

type Plan = { id: number; name: string; monthly_fee?: number; monthly_hours?: number };
type Customer = { id: string; name: string; email: string; member_name: string | null };

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [newName, setNewName] = useState('');
  const [planSel, setPlanSel] = useState<Record<number, string>>({});
  const [startSel, setStartSel] = useState<Record<number, string>>({});
  const [userSel, setUserSel] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    try {
      const [m, p, c] = await Promise.all([api('/admin/members'), api('/plans'), api('/admin/customers')]);
      setMembers(m); setPlans(p); setCustomers(c);
    } catch (e) { setError(e); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, okMsg: (r: any) => string) => {
    setError(null); setNotice('');
    try {
      const r = await fn();
      setNotice(r?.message || okMsg(r));
      await load();
    } catch (e) { setError(e); }
  };

  return (
    <>
      <h1>멤버·청구</h1>
      <div className="toolbar"><div className="row">
        <label>회사 이름<input value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
        <button className="primary" onClick={() => act(() => api('/admin/members', { body: { name: newName } }), (r) => `회사 멤버 "${r.name}"을 만들었어요.`).then(() => setNewName(''))}>회사 멤버 만들기</button>
      </div></div>
      <ErrorBox error={error} />
      <Notice>{notice}</Notice>
      <div className="grid">
        {members.map((m) => {
          const b = m.billing;
          return (
            <div className="card" key={m.id}>
              <div className="card-head"><span>{m.name}</span> <span className={`tag ${m.type === 'company' ? 'company' : ''}`}>{m.type === 'company' ? '회사' : '개인'}</span></div>
              <h2>소속 고객</h2>
              {m.users.length === 0 ? <div className="muted">없음</div> : (
                <ul className="plain">
                  {m.users.map((u: any) => (
                    <li key={u.member_user_id}>
                      <span className="chip">{u.name} <span className="muted small">{u.email}</span>{' '}
                      <button className="small danger" onClick={() => act(() => api(`/admin/member-users/${u.member_user_id}/leave`, { method: 'POST', body: {} }), () => '퇴사 처리했어요.')}>퇴사 처리</button></span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="row" style={{ marginBottom: 4 }}>
                <label>고객 선택
                  <select value={userSel[m.id] ?? ''} onChange={(e) => setUserSel({ ...userSel, [m.id]: e.target.value })}>
                    <option value="">선택…</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email}){c.member_name ? ` · 현재 ${c.member_name}` : ''}</option>)}
                  </select>
                </label>
                <button className="small" onClick={() => act(() => api(`/admin/members/${m.id}/users`, { body: { user_id: userSel[m.id] || undefined } }), () => '고객을 소속시켰어요.')}>고객 소속 추가</button>
              </div>

              <h2>멤버십</h2>
              {m.membership ? (
                <div>
                  {m.membership.plan_name} <span className="muted small">{ymd(m.membership.start_date)} ~ {ymd(m.membership.end_date)}</span>{' '}
                  <button className="small danger" onClick={() => act(() => api(`/admin/memberships/${m.membership.id}/terminate`, { method: 'POST', body: {} }), (r) => `해지했어요. 이후 예약 ${r.cancelled_reservations}건을 취소했어요.`)}>해지</button>
                </div>
              ) : <div className="muted">현재 멤버십 없음</div>}
              <div className="row" style={{ marginTop: 8 }}>
                <label>종류
                  <select value={planSel[m.id] ?? ''} onChange={(e) => setPlanSel({ ...planSel, [m.id]: e.target.value })}>
                    <option value="">선택…</option>
                    {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label>시작일(선택)<input type="date" value={startSel[m.id] ?? ''} onChange={(e) => setStartSel({ ...startSel, [m.id]: e.target.value })} /></label>
                <button className="small" onClick={() => act(() => api(`/admin/members/${m.id}/membership`, { body: { plan_id: planSel[m.id] ? Number(planSel[m.id]) : undefined, start_date: startSel[m.id] || undefined } }), () => '멤버십을 추가했어요.')}>멤버십 추가</button>
              </div>

              <h2>청구</h2>
              {!b ? <div className="muted">이용 중인 멤버십이 없어 청구 내역이 없어요.</div> : (
                <dl className="kv">
                  <dt>요금제</dt><dd>{b.plan_name}</dd>
                  <dt>이번 주기</dt><dd>{ymd(b.cycle_start)} ~ {ymd(b.cycle_end)}</dd>
                  <dt>기본 요금</dt><dd>{won(b.plan_fee)}</dd>
                  <dt>사용 / 전체</dt><dd>{mins(b.used_minutes)} / {mins(b.quota_minutes)}</dd>
                  <dt>청구되는 초과</dt><dd>{mins(b.overage_minutes_billed)}</dd>
                  <dt>면제된 초과</dt><dd>{mins(b.overage_minutes_waived)}<div className="muted small">노쇼로 생긴 초과는 과금하지 않아요</div></dd>
                  <dt>초과 금액</dt><dd>{won(b.overage_amount)}</dd>
                  <dt className="total">총 청구액</dt><dd className="total">{won(b.total_amount)}</dd>
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
