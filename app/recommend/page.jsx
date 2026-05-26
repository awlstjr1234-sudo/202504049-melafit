'use client';
import { useState, useEffect } from 'react';
import RecipeCard from '@/components/RecipeCard';
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

export default function RecommendPage() {
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(30000);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState('예산 상한을 선택한 뒤 추천 버튼을 누르면 결과가 표시됩니다.');
  const [noMatch, setNoMatch] = useState(false);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('mealfit_budget') || '150000');
    setMaxBudget(Math.min(30000, saved));

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'ingredients') {
      const myIngredients = JSON.parse(localStorage.getItem('mealfit_ingredients') || '[]');
      runIngredientRecommend(myIngredients);
    } else {
      runBudgetRecommend(0, Math.min(30000, saved));
    }
  }, []);

  const runBudgetRecommend = (min, max) => {
    const filtered = RECIPE_DB.filter((r) => r.cost >= min && r.cost <= max).sort((a, b) => a.cost - b.cost);
    setResults(filtered);
    setNoMatch(filtered.length === 0);
    const rangeText = min > 0 ? `${min.toLocaleString()}원 ~ ${max.toLocaleString()}원` : `${max.toLocaleString()}원 이하`;
    setMeta(filtered.length ? `${rangeText} ${filtered.length}개 검색됨` : '결과 없음');
  };

  const runIngredientRecommend = (ingredients) => {
    if (!ingredients.length) {
      setResults([]);
      setMeta('재료관리 탭에서 보유 재료를 먼저 등록해주세요.');
      setNoMatch(true);
      return;
    }
    const scored = RECIPE_DB.map((r) => {
      const matched = r.ingredients.filter((ing) =>
        ingredients.some((u) => u.includes(ing.split(' ')[0]) || ing.includes(u))
      );
      return { ...r, matchCount: matched.length, matchedIngredients: matched };
    }).filter((r) => r.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);

    setResults(scored);
    setNoMatch(scored.length === 0);
    setMeta(scored.length ? `보유 재료 기반 ${scored.length}개 메뉴 검색됨` : '매칭 결과 없음');
  };

  const handleBudgetRecommend = () => runBudgetRecommend(minBudget, maxBudget);

  const handleKeywordSearch = () => {
    if (!keyword.trim()) { alert('검색할 키워드를 입력해주세요.'); return; }
    const found = RECIPE_DB.filter((r) =>
      r.name.includes(keyword) || r.description.includes(keyword) || r.ingredients.some((i) => i.includes(keyword))
    );
    setResults(found);
    setNoMatch(found.length === 0);
    setMeta(found.length ? `"${keyword}" 검색 결과 ${found.length}개` : `"${keyword}" 검색 결과 없음`);
  };

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">메뉴추천</p>
        <h1 style={{ fontSize: '2.4rem' }}>메뉴 추천</h1>

        <div className="inline-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ margin: 0, color: '#5b6655', fontSize: '0.92rem' }}>예산 범위를 입력하면 해당 범위의 메뉴를 추천합니다.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{ margin: 0, whiteSpace: 'nowrap' }}>예산 범위</label>
            <input type="number" value={minBudget} min="0" step="10000" placeholder="최솟값" style={{ width: '110px' }} onChange={(e) => setMinBudget(Number(e.target.value))} />
            <span style={{ color: '#5b6655', alignSelf: 'center' }}>~</span>
            <input type="number" value={maxBudget} min="0" step="10000" placeholder="최댓값" style={{ width: '110px' }} onChange={(e) => setMaxBudget(Number(e.target.value))} />
            <span style={{ color: '#5b6655', alignSelf: 'center', whiteSpace: 'nowrap' }}>원</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <button className="btn primary" type="button" onClick={handleBudgetRecommend}>예산별 메뉴 추천</button>
        </div>

        <div className="form-grid" style={{ marginBottom: '14px' }}>
          <div>
            <label>키워드로 메뉴 검색</label>
            <textarea rows="2" placeholder="예: 김치, 계란, 돼지고기, 매콤한, 건강식 등 키워드 입력"
              value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <button className="btn" type="button" onClick={handleKeywordSearch}>키워드 검색</button>
        </div>

        <div className="ai-result" style={{ marginBottom: '14px' }}>
          {results.length === 0 && noMatch ? (
            <>
              <p className="notice">해당 예산 범위에 맞는 레시피가 없습니다.</p>
              <ExternalLinks query="한국 요리 레시피" />
            </>
          ) : results.length === 0 ? (
            <p className="notice">{meta}</p>
          ) : (
            results.map((r, i) => <RecipeCard key={i} recipe={r} />)
          )}
        </div>
        <p style={{ margin: 0, color: '#5a6455', fontSize: '0.88rem' }}>{meta}</p>
      </section>
    </main>
  );
}
