'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, [pathname]);

  const active = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-icon">🥬</span>
        <span>Meal Fit</span>
      </Link>
      <nav className="nav">
        {!isLoggedIn && (
          <Link className={active('/login') ? 'active' : ''} href="/login">
            로그인/회원가입
          </Link>
        )}
        <Link className={active('/search') ? 'active' : ''} href="/search">레시피 검색</Link>
        <Link className={active('/recommend') ? 'active' : ''} href="/recommend">메뉴추천</Link>
        <Link className={active('/ingredients') ? 'active' : ''} href="/ingredients">재료관리</Link>
        <Link className={active('/settings') ? 'active' : ''} href="/settings">설정</Link>
      </nav>
    </header>
  );
}
