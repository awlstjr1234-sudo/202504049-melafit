'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getToken, clearAuth, apiCall, setUser } from '@/lib/auth';

export default function SettingsPage() {
  const [budget, setBudget] = useState(150000);
  const [budgetText, setBudgetText] = useState('현재 월 예산: 150,000원');
  const [accountHtml, setAccountHtml] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('mealfit_budget') || '150000');
    setBudget(saved);
    setBudgetText(`현재 월 예산: ${saved.toLocaleString()}원`);
    loadAccount();
  }, []);

  const loadAccount = async () => {
    const token = getToken();
    if (!token) { setIsLoggedIn(false); return; }
    try {
      const res = await apiCall('/user/me');
      setUser(res.user);
      setUserState(res.user);
      setIsLoggedIn(true);
      if (res.user.settings?.monthlyBudget) {
        const sb = res.user.settings.monthlyBudget;
        localStorage.setItem('mealfit_budget', sb.toString());
        setBudget(sb);
        setBudgetText(`현재 월 예산: ${sb.toLocaleString()}원`);
      }
    } catch {
      clearAuth();
      setIsLoggedIn(false);
    }
  };

  const saveBudget = async () => {
    if (isNaN(budget) || budget < 0) { alert('올바른 예산을 입력해주세요.'); return; }
    localStorage.setItem('mealfit_budget', budget.toString());
    setBudgetText(`현재 월 예산: ${budget.toLocaleString()}원`);
    if (getToken()) {
      try { await apiCall('/user/me', { method: 'PATCH', body: JSON.stringify({ monthlyBudget: budget }) }); } catch { /* 서버 저장 실패 시 로컬만 저장 */ }
    }
    alert(`월 예산이 ${budget.toLocaleString()}원으로 저장되었습니다.`);
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUserState(null);
  };

  return (
    <main className="page" style={{ maxWidth: '900px' }}>
      <section className="panel">
        <p className="eyebrow">마이페이지</p>
        <h1 style={{ fontSize: '2.3rem' }}>설정</h1>

        <div style={{ marginBottom: '16px' }}>
          {!isLoggedIn ? (
            <div className="notice" style={{ display: 'block' }}>
              <p style={{ margin: 0 }}>로그인이 필요합니다. <Link href="/login" style={{ color: 'var(--brand-dark)', fontWeight: '700' }}>로그인하기</Link></p>
            </div>
          ) : user ? (
            <article className="account-summary-card">
              <h3>계정 정보</h3>
              <div className="account-summary-grid">
                <div><span>아이디</span><strong>{user.id}</strong></div>
                <div><span>이름</span><strong>{user.name || '미설정'}</strong></div>
                <div><span>가입 유형</span><strong>{user.loginType}</strong></div>
              </div>
            </article>
          ) : (
            <p className="notice">로그인된 계정 정보를 불러오는 중입니다.</p>
          )}
        </div>

        <article className="panel" style={{ margin: '0 0 14px' }}>
          <h3>예산 관리</h3>
          <div className="row">
            <input type="number" value={budget} min="0" step="1000" onChange={(e) => setBudget(Number(e.target.value))} />
            <button className="btn primary" type="button" onClick={saveBudget}>예산 저장</button>
          </div>
          <p style={{ color: '#5a6354' }}>{budgetText}</p>
        </article>

        {isLoggedIn && (
          <button className="btn ghost" type="button" style={{ marginTop: '4px', borderColor: '#d2b2a9', color: 'var(--danger)' }} onClick={handleLogout}>
            로그아웃
          </button>
        )}
      </section>
    </main>
  );
}
