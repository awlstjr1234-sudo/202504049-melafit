'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, setUser, clearAuth, apiCall, getApiUrl } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [notice, setNotice] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPw2, setSignupPw2] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    const oauthError = params.get('error');

    if (oauthToken) {
      setToken(oauthToken);
      window.history.replaceState({}, '', window.location.pathname);
      setNotice({ msg: '소셜 로그인 성공! 홈으로 이동합니다...', isError: false });
      setTimeout(() => router.push('/'), 900);
      return;
    }
    if (oauthError) {
      setNotice({ msg: decodeURIComponent(oauthError), isError: true });
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (getToken()) {
      apiCall('/user/me')
        .then((res) => { setUser(res.user); setIsLoggedIn(true); })
        .catch(() => { clearAuth(); setIsLoggedIn(false); });
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !loginPw) { setNotice({ msg: '아이디와 비밀번호를 입력해주세요.', isError: true }); return; }
    try {
      const res = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ id: loginId, password: loginPw }) });
      setToken(res.token); setUser(res.user);
      setLoginId(''); setLoginPw('');
      setNotice({ msg: '로그인 성공! 홈으로 이동합니다...', isError: false });
      setTimeout(() => router.push('/'), 900);
    } catch (err) { setNotice({ msg: err.message, isError: true }); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupId || signupId.length < 4) { setNotice({ msg: '아이디는 4자 이상이어야 합니다.', isError: true }); return; }
    if (signupPw.length < 4) { setNotice({ msg: '비밀번호는 4자 이상이어야 합니다.', isError: true }); return; }
    if (signupPw !== signupPw2) { setNotice({ msg: '비밀번호가 일치하지 않습니다.', isError: true }); return; }
    try {
      const res = await apiCall('/auth/signup', { method: 'POST', body: JSON.stringify({ id: signupId, password: signupPw, passwordConfirm: signupPw2 }) });
      setToken(res.token); setUser(res.user);
      setNotice({ msg: '회원가입 완료! 홈으로 이동합니다...', isError: false });
      setTimeout(() => router.push('/'), 900);
    } catch (err) { setNotice({ msg: err.message, isError: true }); }
  };

  const handleSocialLogin = (provider) => {
    clearAuth();
    window.location.href = `${getApiUrl()}/auth/${provider}`;
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setNotice({ msg: '로그아웃되었습니다.', isError: false });
  };

  return (
    <main className="page">
      <section className="panel" style={{ maxWidth: '620px', margin: '0 auto' }}>
        <p className="eyebrow">로그인/회원가입</p>
        <h1 style={{ fontSize: '2.5rem' }}>Meal Fit 로그인</h1>

        <div className="auth-tabs" style={{ marginBottom: '14px' }}>
          <button className={`chip ${activeTab === 'login' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('login')}>로그인</button>
          <button className={`chip ${activeTab === 'signup' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('signup')}>회원가입</button>
        </div>

        {activeTab === 'login' && (
          <form className="form-grid" onSubmit={handleLogin}>
            <div>
              <label htmlFor="loginId">아이디</label>
              <input id="loginId" type="text" placeholder="아이디 입력" required autoComplete="username" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
            </div>
            <div>
              <label htmlFor="loginPw">비밀번호</label>
              <input id="loginPw" type="password" placeholder="비밀번호 입력" required autoComplete="current-password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
            </div>
            <button className="btn primary full" type="submit">로그인</button>
          </form>
        )}

        {activeTab === 'signup' && (
          <form className="form-grid" onSubmit={handleSignup}>
            <div>
              <label htmlFor="signupId">아이디</label>
              <input id="signupId" type="text" placeholder="4자 이상" required autoComplete="username" value={signupId} onChange={(e) => setSignupId(e.target.value)} />
            </div>
            <div>
              <label htmlFor="signupPw">비밀번호</label>
              <input id="signupPw" type="password" placeholder="4자 이상" required autoComplete="new-password" value={signupPw} onChange={(e) => setSignupPw(e.target.value)} />
            </div>
            <div>
              <label htmlFor="signupPw2">비밀번호 확인</label>
              <input id="signupPw2" type="password" placeholder="비밀번호 재입력" required autoComplete="new-password" value={signupPw2} onChange={(e) => setSignupPw2(e.target.value)} />
            </div>
            <button className="btn primary full" type="submit">회원가입</button>
          </form>
        )}

        {notice && (
          <div className="notice" style={{ display: 'block', marginTop: '12px', background: notice.isError ? '#fce8e3' : '#eef6e7', color: notice.isError ? '#7a3425' : '#2f4b21' }}>
            {notice.msg}
          </div>
        )}

        <p style={{ textAlign: 'center', margin: '20px 0 8px', color: '#5e6657' }}>SNS 계정으로 로그인</p>
        <div className="socials">
          <button className="social kakao" type="button" title="카카오로 로그인" onClick={() => handleSocialLogin('kakao')}>
            <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" alt="카카오" width="22" height="22"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = 'K'; }} />
          </button>
          <button className="social naver" type="button" title="네이버로 로그인" onClick={() => handleSocialLogin('naver')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M13.5 12.6 8.3 4H4v16h6.5V11.4L15.7 20H20V4h-6.5z" /></svg>
          </button>
          <button className="social google" type="button" title="구글로 로그인" onClick={() => handleSocialLogin('google')}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>
        </div>
        <div className="social-labels">
          <span>카카오</span><span>네이버</span><span>구글</span>
        </div>

        {isLoggedIn && (
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button className="btn ghost" type="button" onClick={handleLogout}>로그아웃</button>
          </div>
        )}
      </section>
    </main>
  );
}
