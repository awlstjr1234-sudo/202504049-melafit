'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [ingInput, setIngInput] = useState('');
  const [shopInput, setShopInput] = useState('');

  useEffect(() => {
    setIngredients(JSON.parse(localStorage.getItem('mealfit_ingredients') || '[]'));
    setShopping(JSON.parse(localStorage.getItem('mealfit_shopping') || '[]'));
  }, []);

  const saveIng = (list) => { localStorage.setItem('mealfit_ingredients', JSON.stringify(list)); setIngredients(list); };
  const saveShop = (list) => { localStorage.setItem('mealfit_shopping', JSON.stringify(list)); setShopping(list); };

  const addIng = () => {
    if (!ingInput.trim()) { alert('재료명을 입력해주세요.'); return; }
    saveIng([...ingredients, ingInput.trim()]);
    setIngInput('');
  };

  const addShop = () => {
    if (!shopInput.trim()) { alert('재료를 입력해주세요.'); return; }
    saveShop([...shopping, { text: shopInput.trim(), done: false }]);
    setShopInput('');
  };

  const delIng = (i) => { const next = [...ingredients]; next.splice(i, 1); saveIng(next); };
  const delShop = (i) => { const next = [...shopping]; next.splice(i, 1); saveShop(next); };
  const toggleShop = (i) => { const next = [...shopping]; next[i] = { ...next[i], done: !next[i].done }; saveShop(next); };
  const clearIng = () => { if (!ingredients.length || confirm('보유 재료를 전체 초기화하시겠습니까?')) saveIng([]); };
  const clearShop = () => { if (!shopping.length || confirm('장보기 리스트를 전체 초기화하시겠습니까?')) saveShop([]); };

  return (
    <main className="page">
      <section className="grid-two">
        <article className="panel">
          <p className="eyebrow">재료관리</p>
          <h2>재료 등록</h2>
          <div className="form-grid">
            <input type="text" placeholder="예: 계란 6개" value={ingInput}
              onChange={(e) => setIngInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIng(); } }} />
            <button className="btn primary" type="button" onClick={addIng}>재료 등록</button>
          </div>
          <div className="inline-between" style={{ marginTop: '16px', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>보유 재료 목록</h3>
            <button className="btn ghost" type="button" onClick={clearIng}>전체 초기화</button>
          </div>
          <ul className="list managed-list" style={{ marginTop: '10px' }}>
            {ingredients.length === 0 ? (
              <li style={{ color: '#6b7565', fontSize: '0.9rem', listStyle: 'none', padding: '8px 0' }}>등록된 재료가 없습니다.</li>
            ) : ingredients.map((item, i) => (
              <li key={i} className="managed-item">
                <div className="managed-check">
                  <span className="item-text">{item}</span>
                  <button className="btn ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => delIng(i)}>삭제</button>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="eyebrow">장보기 리스트 작성</p>
          <h2>부족한 재료</h2>
          <div className="form-grid">
            <input type="text" placeholder="예: 돼지고기 앞다리살 400g" value={shopInput}
              onChange={(e) => setShopInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addShop(); } }} />
            <button className="btn" type="button" onClick={addShop}>리스트 추가</button>
          </div>
          <div className="inline-between" style={{ marginTop: '16px', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>장보기 리스트</h3>
            <button className="btn ghost" type="button" onClick={clearShop}>전체 초기화</button>
          </div>
          <ul className="list managed-list" style={{ marginTop: '10px' }}>
            {shopping.length === 0 ? (
              <li style={{ color: '#6b7565', fontSize: '0.9rem', listStyle: 'none', padding: '8px 0' }}>장보기 리스트가 비어있습니다.</li>
            ) : shopping.map((item, i) => (
              <li key={i} className={`managed-item ${item.done ? 'completed' : ''}`}>
                <div className="managed-check">
                  <input className="item-check" type="checkbox" checked={item.done} onChange={() => toggleShop(i)} />
                  <span className="item-text">{item.text}</span>
                  <button className="btn ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => delShop(i)}>삭제</button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel">
        <h2>보유 재료 기반 추천</h2>
        <p style={{ color: '#5d6659' }}>재료를 많이 등록할수록 추천 레시피 정확도가 높아집니다.</p>
        <Link className="btn primary" href="/recommend?mode=ingredients">보유 재료로 AI 메뉴 추천받기</Link>
      </section>
    </main>
  );
}
