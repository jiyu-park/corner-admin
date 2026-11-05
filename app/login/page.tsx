'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveSession, User } from '@/lib/api';
import { ErrorBox } from '@/components/Feedback';
import { LogoMark } from '@/components/Logo';

// 체험용 직원 계정 안내는 환경 변수로 켠다. 값이 없으면 화면에 나오지 않는다. (관리자 계정은 넣지 않는다)
const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

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
      <div className="auth-logo"><LogoMark size={56} /></div>
      <h1>모퉁이 어드민 로그인</h1>
      <form className="stack" onSubmit={submit}>
        <label>이메일<input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <button className="primary" disabled={busy}>로그인</button>
      </form>
      <ErrorBox error={error} />
      {demoEmail && demoPassword && (
        <div className="demo">
          <strong>체험용 직원 계정</strong>
          <p className="small">
            이메일 <code>{demoEmail}</code>
            <br />
            비밀번호 <code>{demoPassword}</code>
          </p>
          <p className="small">일반 직원 권한이라 직원 관리 메뉴는 보이지 않습니다.</p>
          <button
            type="button"
            className="outline"
            onClick={() => {
              setEmail(demoEmail);
              setPassword(demoPassword);
            }}
          >
            체험용 계정으로 채우기
          </button>
        </div>
      )}
    </div>
  );
}
