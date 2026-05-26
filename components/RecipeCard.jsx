export default function RecipeCard({ recipe }) {
  return (
    <article className="ai-summary-card" style={{ marginBottom: '16px' }}>
      <h3 style={{ marginBottom: '6px' }}>{recipe.name}</h3>
      <p style={{ color: '#5a6455', fontSize: '0.9rem', marginBottom: '10px' }}>{recipe.description}</p>
      <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
        예상 재료비: <strong>{recipe.cost.toLocaleString()}원</strong> (2인분) &nbsp;|&nbsp;
        조리 시간: <strong>{recipe.time}분</strong> &nbsp;|&nbsp;
        난이도: <strong>{recipe.difficulty}</strong>
      </p>
      <details style={{ fontSize: '0.88rem', color: '#3d5230', marginBottom: '6px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '4px' }}>재료 보기</summary>
        <ul style={{ margin: '6px 0 0', paddingLeft: '16px', lineHeight: '1.8' }}>
          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </details>
      <details style={{ fontSize: '0.88rem', color: '#3d5230' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '4px' }}>조리 순서 보기</summary>
        <ol style={{ margin: '6px 0 0', paddingLeft: '16px', lineHeight: '1.8' }}>
          {recipe.steps.map((step, i) => (
            <li key={i} style={{ marginBottom: '6px', lineHeight: '1.6' }}>{i + 1}. {step}</li>
          ))}
        </ol>
      </details>
      {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
        <p style={{ fontSize: '0.82rem', color: '#4a7a35', margin: '8px 0 0', padding: '6px', background: '#f0f7eb', borderRadius: '6px' }}>
          매칭 재료: {recipe.matchedIngredients.join(', ')} ({recipe.matchCount}개)
        </p>
      )}
    </article>
  );
}
