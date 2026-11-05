'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser, saveUser } from '@/lib/api';
import { ErrorBox } from '@/components/Feedback';

export default function ChangePassword() {
  const router = useRouter();
  const [oldPw, setOld] = useState('');
  const [newPw, setNew] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/auth/change-password', { body: { old_password: oldPw, new_password: newPw } });
      const u = getUser();
      if (u) saveUser({ ...u, must_change_password: false });
      router.replace('/');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card narrow">
      <h1>새 비밀번호로 바꿔 주세요</h1>
      <p className="muted">임시 비밀번호로 로그인하셨어요. 새 비밀번호를 정하면 화면을 쓸 수 있어요.</p>
      <form className="stack" onSubmit={submit}>
        <label>현재(임시) 비밀번호<input type="password" value={oldPw} onChange={(e) => setOld(e.target.value)} autoComplete="current-password" /></label>
        <label>새 비밀번호<input type="password" value={newPw} onChange={(e) => setNew(e.target.value)} autoComplete="new-password" /></label>
        <button className="primary" disabled={busy}>비밀번호 변경</button>
      </form>
      <ErrorBox error={error} />
    </div>
  );
}
