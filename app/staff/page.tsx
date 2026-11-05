'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser } from '@/lib/api';
import { ErrorBox, Notice } from '@/components/Feedback';
import { ROLE_LABEL } from '@/lib/format';

export default function Staff() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [temp, setTemp] = useState<{ name: string; email: string; pw: string } | null>(null);
  const [form, setForm] = useState({ email: '', name: '', role: 'staff' });
  const [editId, setEditId] = useState<number | null>(null);
  const [edit, setEdit] = useState({ name: '', role: 'staff', is_active: true });

  const load = useCallback(async () => {
    try { setRows(await api('/admin/staff')); } catch (e) { setError(e); }
  }, []);
  useEffect(() => {
    if (getUser()?.role !== 'admin') { router.replace('/'); return; }
    load();
  }, [load, router]);

  const act = async (fn: () => Promise<any>, okMsg: string, showTemp = false) => {
    setError(null); setNotice(''); setTemp(null);
    try {
      const r = await fn();
      if (showTemp && r?.temp_password) setTemp({ name: r.user.name, email: r.user.email, pw: r.temp_password });
      else setNotice(okMsg);
      await load();
      return true;
    } catch (e) { setError(e); return false; }
  };

  return (
    <>
      <h1>직원 관리</h1>
      <form className="card row" onSubmit={(e) => { e.preventDefault(); act(() => api('/admin/staff', { body: form }), '', true); }}>
        <label>이메일<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>이름<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>역할
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="staff">직원</option><option value="admin">관리자</option>
          </select>
        </label>
        <button className="primary">직원 만들기</button>
      </form>
      <ErrorBox error={error} />
      <Notice>{notice}</Notice>
      {temp && (
        <div className="tempbox">
          <div><strong>{temp.name}</strong> ({temp.email})의 임시 비밀번호</div>
          <code>{temp.pw}</code>
          <div>이 비밀번호는 <strong>지금 한 번만</strong> 보여요. 복사해서 직원에게 전달해 주세요. 직원은 첫 로그인 때 바꿔야 해요.</div>
          <button style={{ marginTop: 8 }} onClick={() => navigator.clipboard?.writeText(temp.pw)}>복사</button>
        </div>
      )}
      <table>
        <thead><tr><th>이메일</th><th>이름</th><th>역할</th><th>사용 여부</th><th>임시 비밀번호</th><th>동작</th></tr></thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>{s.email}</td>
              {editId === s.id ? (
                <>
                  <td><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></td>
                  <td>
                    <select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>
                      <option value="staff">직원</option><option value="admin">관리자</option>
                    </select>
                  </td>
                  <td>
                    <label style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> 사용
                    </label>
                  </td>
                  <td>{s.must_change_password ? '변경 대기' : '-'}</td>
                  <td>
                    <button className="small primary" onClick={async () => { if (await act(() => api(`/admin/staff/${s.id}`, { method: 'PATCH', body: edit }), '수정했어요.')) setEditId(null); }}>저장</button>{' '}
                    <button className="small" onClick={() => setEditId(null)}>취소</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{s.name}</td>
                  <td>{ROLE_LABEL[s.role] ?? s.role}</td>
                  <td>{s.is_active ? '사용 중' : <span className="badge st-no_show">중지</span>}</td>
                  <td>{s.must_change_password ? '변경 대기' : '-'}</td>
                  <td>
                    <button className="small" onClick={() => { setEditId(s.id); setEdit({ name: s.name, role: s.role, is_active: s.is_active }); }}>수정</button>{' '}
                    <button className="small" onClick={() => act(() => api(`/admin/staff/${s.id}/reset-password`, { method: 'POST' }), '', true)}>비밀번호 리셋</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
