'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getToken, getUser, User } from '@/lib/api';
import { ROLE_LABEL } from '@/lib/format';
import { Logo } from './Logo';

const PUBLIC = ['/login'];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const u = getUser();
    if (PUBLIC.includes(path)) {
      setUser(null);
      setReady(true);
      return;
    }
    if (!token || !u) {
      router.replace('/login');
      return;
    }
    if (u.must_change_password && path !== '/change-password') {
      router.replace('/change-password');
      return;
    }
    if (!u.must_change_password && path === '/change-password') {
      router.replace('/');
      return;
    }
    setUser(u);
    setReady(true);
  }, [path, router]);

  const logout = () => {
    clearSession();
    router.replace('/login');
  };

  if (!ready) return <div className="center muted">불러오는 중…</div>;
  if (PUBLIC.includes(path) || !user) return <>{children}</>;

  const forced = user.must_change_password;
  const nav = [
    { href: '/', label: '예약 현황' },
    { href: '/members', label: '멤버·청구' },
    { href: '/seats', label: '고정석' },
    { href: '/reports', label: '현황' },
    ...(user.role === 'admin' ? [{ href: '/staff', label: '직원 관리' }] : []),
  ];
  return (
    <>
      <header className="top">
        <Link href="/" className="brand" aria-label="모퉁이 어드민 홈"><Logo size={28} text="모퉁이 어드민" variant="white" /></Link>
        {!forced && (
          <nav>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={path === n.href ? 'active' : ''}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="who">
          <span>
            {user.name} <span className={`badge role ${user.role}`}>{ROLE_LABEL[user.role]}</span>
          </span>
          <button className="outline" onClick={logout}>로그아웃</button>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
