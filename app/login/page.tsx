'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveSession, User } from '@/lib/api';
import { ErrorBox } from '@/components/Feedback';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; user: User }>('/auth/login', { body: { email, password, app: 'admin' }, noAuthRedirect: true });
      saveSession(r.token, r.user);
      router.replace(r.user.must_change_password ? '/change-password' : '/');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card narrow">
      <h1>모퉁이 어드민 로그인</h1>
      <form className="stack" onSubmit={submit}>
        <label>이메일<input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <button className="primary" disabled={busy}>로그인</button>
      </form>
      <ErrorBox error={error} />
    </div>
  );
}
