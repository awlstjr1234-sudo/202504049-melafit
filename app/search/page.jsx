'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RecipeCard from '@/components/RecipeCard';
import { RECIPE_DB } from '@/lib/recipeDb';
import { getApiUrl } from '@/lib/auth';

function ExternalLinks({ query }) {
  const q = encodeURIComponent(query);
  return (
    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <a href={`https://www.10000recipe.com/recipe/list.html?q=${q}`} target="_blank" rel="noopener" className="btn" style={{ fontSize: '0.85rem' }}>만개의레시피에서 검색</a>
      <a href={`https://search.naver.com/search.naver?query=${q}+레시피`} target="_blank" rel="noopener" className="btn" style={{ fontSize: '0.85rem' }}>네이버에서 검색</a>
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [foodName, setFoodName] = useState('');
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(10000);
  const [category, setCategory] = useState('전체');
  const [results, setResults] = useState(null);
  const [webItems, setWebItems] = useState([]);
  const [meta, setMeta] = useState('대기 중');
  const [detailInput, setDetailInput] = useState('');

  const CATEGORIES = ['전체', '초저가', '간편요리', '건강식'];

  const doSearch = async () => {
    if (!foodName.trim()) { alert('검색할 음식 이름을 입력해주세요.'); return; }
    setResults(null); setWebItems([]); setMeta('검색 중...');

    let local = RECIPE_DB.filter((r) =>
      r.name.includes(foodName) || r.description.includes(foodName) || r.ingredients.some((i) => i.includes(foodName))
    ).filter((r) => r.cost >= minBudget && r.cost <= maxBudget);

    if (category !== '전체') local = local.filter((r) => r.category.includes(category));

    let web = [];
    try {
      const res = await fetch(`${getApiUrl()}/search/recipes?q=${encodeURIComponent(foodName)}`);
      const data = await res.json();
      if (data.success && data.items.length > 0) web = data.items;
    } catch { /* 검색 API 실패 시 무시 */ }

    setResults(local);
    setWebItems(web);
    setMeta(local.length > 0 || web.length > 0 ? `로컬 ${local.length}개 + 웹 검색 결과` : `"${foodName}" 검색 결과 없음`);
  };

  const goDetail = () => {
    if (!detailInput.trim()) { alert('메뉴명을 입력해주세요.'); return; }
    router.push(`/recipe?menu=${encodeURIComponent(detailInput.trim())}`);
  };

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">레시피 검색</p>
        <h1 style={{ fontSize: '2.4rem' }}>음식 + 예산 맞춤 검색</h1>
        <div className="form-grid">
          <div>
            <label>먹고 싶은 음식</label>
            <input type="text" placeholder="예: 김치찌개, 제육볶음" value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()} />
          </div>
          <div className="row">
            <div>
              <label>최소 금액</label>
              <input type="number" value={minBudget} min="0" step="100" onChange={(e) => setMinBudget(Number(e.target.value))} />
            </div>
            <div>
              <label>최대 금액</label>
              <input type="number" value={maxBudget} min="1000" step="100" onChange={(e) => setMaxBudget(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label>카테고리</label>
            <div className="chips">
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`chip ${category === cat ? 'active' : ''}`} type="button" onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <button className="btn primary" type="button" onClick={doSearch}>레시피검색</button>
        </div>
      </section>

      <section className="panel">
        <h2>검색 결과</h2>
        {results === null ? (
          <p className="notice">검색 조건을 입력하고 레시피 검색 버튼을 누르면 결과가 표시됩니다.</p>
        ) : results.length === 0 && webItems.length === 0 ? (
          <>
            <p className="notice">&ldquo;{foodName}&rdquo; 검색 결과가 없습니다.</p>
            <ExternalLinks query={foodName + ' 레시피'} />
          </>
        ) : (
          <div className="ai-result">
            {results.length > 0 && (
              <p style={{ color: '#5a6455', fontSize: '0.9rem' }}>&ldquo;{foodName}&rdquo; 레시피 <strong>{results.length}개</strong></p>
            )}
            {results.map((r, i) => <RecipeCard key={i} recipe={r} />)}
            {webItems.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '2px solid #e0ead6', paddingTop: '16px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.05rem' }}>🔍 웹 검색 결과 (네이버 블로그)</h3>
                {webItems.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener"
                    style={{ display: 'block', textDecoration: 'none', padding: '12px', border: '1px solid #dde8d4', borderRadius: '10px', marginBottom: '10px', background: '#fff' }}>
                    <p style={{ fontWeight: '700', color: '#2f4b21', margin: '0 0 4px' }}>{item.title}</p>
                    <p style={{ fontSize: '0.85rem', color: '#5a6455', margin: '0 0 6px', lineHeight: '1.5' }}>{item.description}</p>
                    <span style={{ fontSize: '0.78rem', color: '#7a8c72' }}>{item.bloggerName} · {item.date}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        <p style={{ margin: '8px 0 0', color: '#5a6455', fontSize: '0.9rem' }}>{meta}</p>
      </section>

      <section className="panel">
        <h2>레시피 상세 검색</h2>
        <p style={{ color: '#5d6659', marginBottom: '12px' }}>특정 메뉴의 재료, 가격, 조리법을 상세하게 알려드립니다.</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="메뉴명 입력 (예: 김치찌개, 비빔밥)" style={{ flex: '1', minWidth: '200px' }}
            value={detailInput} onChange={(e) => setDetailInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goDetail()} />
          <button className="btn primary" type="button" onClick={goDetail}>레시피 상세 보기</button>
        </div>
      </section>
    </main>
  );
}
