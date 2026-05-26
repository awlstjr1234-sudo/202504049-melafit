import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero panel">
        <div>
          <p className="eyebrow">예산에 딱 맞춘 집밥 도우미</p>
          <h1>Meal Fit</h1>
          <p className="lead">보유 재료와 예산, 선호도를 기반으로 AI가 실용적인 레시피를 추천해줍니다.</p>
          <div className="hero-actions">
            <Link className="btn primary" href="/search">레시피 검색 시작</Link>
            <Link className="btn" href="/recommend">추천 레시피 보기</Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="sitemap-grid">
          <Link className="map-card" href="/login">
            <strong>로그인/회원가입</strong>
            <span>아이디 로그인 · 카카오 · 네이버 · 구글</span>
          </Link>
          <Link className="map-card" href="/recommend">
            <strong>메뉴추천</strong>
            <span>예산 범위 추천 · 키워드 검색</span>
          </Link>
          <Link className="map-card" href="/search">
            <strong>레시피 검색</strong>
            <span>음식·예산 검색 · 카테고리 필터 · 조리 순서 · 예상 재료비</span>
          </Link>
          <Link className="map-card" href="/ingredients">
            <strong>재료관리</strong>
            <span>재료 등록 · 보유 재료 목록 · 장보기 리스트</span>
          </Link>
          <Link className="map-card" href="/settings">
            <strong>설정</strong>
            <span>계정 정보 · 월 예산 관리</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
