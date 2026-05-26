'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RECIPE_DB } from '@/lib/recipeDb';

function ExternalLinks({ query }) {
  const q = encodeURIComponent(query);
  return (
    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <a href={`https://www.10000recipe.com/recipe/list.html?q=${q}`} target="_blank" rel="noopener" className="btn" style={{ fontSize: '0.85rem' }}>만개의레시피에서 검색</a>
      <a href={`https://search.naver.com/search.naver?query=${q}+레시피`} target="_blank" rel="noopener" className="btn" style={{ fontSize: '0.85rem' }}>네이버에서 검색</a>
    </div>
  );
}

export default function RecipePage() {
  const [menu, setMenu] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('menu') || '';
    setMenu(m);
    if (!m) { setNotFound(true); return; }
    const found = RECIPE_DB.find((r) => r.name === m || r.name.includes(m) || m.includes(r.name));
    if (found) setRecipe(found);
    else setNotFound(true);
  }, []);

  return (
    <main className="page" style={{ maxWidth: '800px' }}>
      <section className="panel">
        <p className="eyebrow">레시피 상세</p>
        <h1 style={{ fontSize: '2.2rem' }}>{menu || '레시피 상세'}</h1>

        {!menu && (
          <p className="notice" style={{ marginTop: '10px' }}>메뉴 정보가 없습니다. 검색 페이지로 돌아가세요.</p>
        )}

        {recipe && (
          <article className="ai-summary-card" style={{ marginTop: '16px' }}>
            {recipe.image && (
              <img src={recipe.image} alt={recipe.name}
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            )}
            <h3>{recipe.name} 레시피 상세</h3>
            <div style={{ lineHeight: '1.9', marginTop: '10px' }}>
              <p><strong>조리 시간:</strong> {recipe.time}분 &nbsp;|&nbsp; <strong>난이도:</strong> {recipe.difficulty}</p>
              <p><strong>2인분 예상 재료비:</strong> 약 {recipe.cost.toLocaleString()}원 &nbsp;|&nbsp; <strong>1인분:</strong> 약 {Math.round(recipe.cost / 2).toLocaleString()}원</p>
              <details open style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '700', marginBottom: '6px', fontSize: '1rem' }}>필요 재료 (2인분)</summary>
                <ul style={{ paddingLeft: '18px', margin: '6px 0' }}>
                  {recipe.ingredients.map((ing, i) => <li key={i} style={{ marginBottom: '4px' }}>{ing}</li>)}
                </ul>
              </details>
              <details open style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '700', marginBottom: '6px', fontSize: '1rem' }}>조리 순서</summary>
                <ol style={{ paddingLeft: '18px', margin: '6px 0' }}>
                  {recipe.steps.map((step, i) => <li key={i} style={{ marginBottom: '8px', lineHeight: '1.7' }}>{i + 1}. {step}</li>)}
                </ol>
              </details>
            </div>
            <ExternalLinks query={recipe.name + ' 레시피'} />
          </article>
        )}

        {notFound && !recipe && menu && (
          <>
            <p className="notice" style={{ marginTop: '10px' }}>&ldquo;{menu}&rdquo; 레시피를 데이터베이스에서 찾지 못했습니다.</p>
            <ExternalLinks query={menu + ' 레시피'} />
          </>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link className="btn" href="/recommend">← 메뉴 추천으로 돌아가기</Link>
          <Link className="btn" href="/search">레시피 검색</Link>
          <Link className="btn" href="/ingredients">재료 등록하러 가기</Link>
        </div>
      </section>
    </main>
  );
}
