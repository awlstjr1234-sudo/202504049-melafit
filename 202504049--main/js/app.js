// ============================================
// Meal Fit — 프론트엔드
// ============================================

const getApiBase = () => {
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${hostname}:5000/api`;
  }
  // 배포 환경: Render 백엔드 URL로 교체
  return "https://meal-fit-backend.onrender.com/api";
};
const API = getApiBase();

// ---- 인증 토큰 관리 ----
const getToken  = () => { const t = localStorage.getItem("mealfit_token"); return (!t || t === "null" || t === "undefined") ? null : t; };
const setToken  = (t) => localStorage.setItem("mealfit_token", t);
const clearAuth = () => { localStorage.removeItem("mealfit_token"); localStorage.removeItem("mealfit_user"); };
const getUser   = () => { try { const r = localStorage.getItem("mealfit_user"); return r ? JSON.parse(r) : null; } catch { return null; } };
const setUser   = (u) => localStorage.setItem("mealfit_user", JSON.stringify(u));

function escapeHtml(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---- 정적 레시피 데이터베이스 ----
const RECIPE_DB = [
  {
    name: "김치찌개",
    cost: 7000, time: 30, difficulty: "쉬움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Kimchi-jjigae.jpg/320px-Kimchi-jjigae.jpg",
    ingredients: ["돼지고기(삼겹살) 150g", "신김치 200g", "두부 150g", "대파 1/2대", "고춧가루 1큰술", "국간장 1큰술", "참기름 1큰술"],
    description: "대표적인 한국 가정식. 신김치와 돼지고기를 넣어 끓인 얼큰한 찌개.",
    steps: [
      "돼지고기(삼겹살) 150g을 3×3cm 크기로 썬다",
      "냄비를 중불로 달구고 참기름 1큰술을 두른 뒤 돼지고기를 2분간 볶는다",
      "신김치 200g을 4cm 길이로 썰어 넣고 함께 2분 더 볶는다",
      "물 400ml, 고춧가루 1큰술, 국간장 1큰술을 넣고 강불로 끓인다",
      "끓어오르면 중불로 줄이고 두부 150g을 2cm 크기로 썰어 넣는다",
      "15분간 보글보글 끓인 후 대파를 어슷썰어 넣는다",
      "2분 더 끓여 간을 확인한 뒤 완성"
    ]
  },
  {
    name: "된장찌개",
    cost: 5000, time: 25, difficulty: "쉬움",
    category: ["건강식", "초저가"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Korean.food-Doenjang.jjigae-01.jpg/320px-Korean.food-Doenjang.jjigae-01.jpg",
    ingredients: ["된장 1.5큰술", "두부 100g", "애호박 1/2개", "양파 1/4개", "버섯 50g", "대파 1/2대", "마늘 1큰술", "고추장 0.5큰술"],
    description: "건강한 한국 전통 찌개. 구수한 된장과 각종 채소로 깊은 맛.",
    steps: [
      "냄비에 물 350ml와 다시마 10g을 넣고 10분간 약불로 우린 뒤 다시마를 건진다",
      "된장 1.5큰술, 고추장 0.5큰술을 육수에 풀어 넣는다",
      "중불로 올려 끓이면서 두부 100g을 2cm 주사위 모양으로 썬다",
      "애호박 1/2개를 반달 모양(1cm 두께)으로 썰어 넣는다",
      "양파 1/4개(채썰기), 버섯 50g을 넣고 10분간 끓인다",
      "마늘 1큰술을 넣고 3분 더 끓인다",
      "대파를 어슷썰어 넣고 불을 끈 뒤 완성"
    ]
  },
  {
    name: "계란볶음밥",
    cost: 2000, time: 10, difficulty: "쉬움",
    category: ["초저가", "간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Fried_rice_ham.jpg/320px-Fried_rice_ham.jpg",
    ingredients: ["찬밥 200g", "계란 2개", "대파 1/4대", "간장 1큰술", "참기름 0.5큰술", "식용유 1큰술", "소금 약간"],
    description: "냉장고 재료로 10분 만에 완성하는 빠르고 맛있는 볶음밥.",
    steps: [
      "대파를 잘게 다진다 (2~3mm 크기)",
      "팬을 강불로 달구고 식용유 1큰술을 두른다",
      "계란 2개를 풀어 팬에 붓고 젓가락으로 빠르게 스크램블한다 (30초)",
      "찬밥 200g을 넣고 주걱으로 누르면서 1~2분간 볶는다",
      "간장 1큰술을 넣고 30초 더 볶아 고슬고슬하게 만든다",
      "다진 대파를 넣고 30초 볶은 뒤 참기름 0.5큰술을 둘러 마무리",
      "소금으로 간을 맞추고 그릇에 담아 완성"
    ]
  },
  {
    name: "제육볶음",
    cost: 8000, time: 25, difficulty: "쉬움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Jeyuk_bokkeum.jpg/320px-Jeyuk_bokkeum.jpg",
    ingredients: ["돼지고기(앞다리살) 200g", "양파 1/2개", "대파 1/2대", "고추장 2큰술", "간장 1큰술", "설탕 1큰술", "다진마늘 1큰술", "참기름 1큰술"],
    description: "매콤달콤한 돼지고기 볶음. 밥 한 공기 순식간에 비우는 반찬.",
    steps: [
      "고추장 2큰술, 간장 1큰술, 설탕 1큰술, 다진마늘 1큰술, 참기름 1큰술, 생강즙 약간을 섞어 양념장을 만든다",
      "돼지고기 200g을 0.5cm 두께로 썰어 양념장에 넣고 30분간 재운다",
      "양파 1/2개는 굵게 채썰고, 대파 1/2대는 어슷썬다",
      "팬을 강불로 달군 뒤 기름 없이 재운 고기를 넣고 3분간 볶는다",
      "고기가 반쯤 익으면 양파와 대파를 넣고 2분 더 볶는다",
      "참기름 약간 두르고 불을 끄면 완성"
    ]
  },
  {
    name: "순두부찌개",
    cost: 6000, time: 20, difficulty: "쉬움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Sundubu-jjigae.jpg/320px-Sundubu-jjigae.jpg",
    ingredients: ["순두부 300g", "계란 1개", "바지락 100g", "고춧가루 2큰술", "대파 1/3대", "마늘 1큰술", "참기름 1큰술", "국간장 1큰술"],
    description: "부드러운 순두부와 바지락의 조화. 얼큰하고 시원한 한국식 찌개.",
    steps: [
      "냄비에 참기름 1큰술을 두르고 고춧가루 2큰술을 넣어 약불로 1분간 볶아 기름을 낸다",
      "바지락 100g을 넣고 중불로 1분간 볶는다",
      "물 300ml와 국간장 1큰술, 다진마늘 1큰술을 넣고 강불로 끓인다",
      "끓어오르면 순두부 300g을 숟가락으로 크게 떠서 넣는다",
      "중불로 줄이고 5분간 끓인다",
      "계란 1개를 깨서 올리고 대파를 어슷썰어 넣는다",
      "뚜껑 덮고 2분 후 계란이 반숙이 되면 완성"
    ]
  },
  {
    name: "비빔밥",
    cost: 8000, time: 35, difficulty: "보통",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Dolsot-bibimbap.jpg/320px-Dolsot-bibimbap.jpg",
    ingredients: ["밥 200g", "시금치 100g", "콩나물 100g", "당근 1/3개", "계란 1개", "고추장 2큰술", "참기름 1큰술", "소금 약간", "식용유"],
    description: "각종 나물과 고추장을 비벼 먹는 영양 가득한 한식. 색감도 아름다운 대표 음식.",
    steps: [
      "시금치 100g을 끓는 소금물에 1분간 데쳐 찬물에 헹군 뒤 물기를 꼭 짜고 참기름·소금으로 무친다",
      "콩나물 100g을 뚜껑 덮고 5분간 삶아 물기 빼고 참기름·소금으로 무친다",
      "당근 1/3개를 곱게 채썰어 소금에 5분 절인 뒤 물기를 짜고 기름 두른 팬에 1분 볶는다",
      "팬에 기름을 두르고 계란 1개를 반숙 프라이한다",
      "따뜻한 밥 200g을 그릇에 담고 나물과 프라이를 색깔별로 올린다",
      "고추장 1~2큰술, 참기름 1큰술을 올리고 취향에 맞게 비빈다"
    ]
  },
  {
    name: "불고기",
    cost: 9000, time: 30, difficulty: "쉬움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Bulgogi.jpg/320px-Bulgogi.jpg",
    ingredients: ["소고기(불고기용) 200g", "양파 1/2개", "대파 1/2대", "간장 3큰술", "설탕 1.5큰술", "참기름 1큰술", "다진마늘 1큰술", "배즙 2큰술"],
    description: "달콤한 간장 양념에 재운 소고기 볶음. 남녀노소 모두 좋아하는 한국 대표 요리.",
    steps: [
      "간장 3큰술, 설탕 1.5큰술, 참기름 1큰술, 다진마늘 1큰술, 배즙 2큰술, 후추 약간으로 양념장을 만든다",
      "소고기 200g을 양념장에 넣고 손으로 조물조물 무쳐 30분~1시간 재운다",
      "양파 1/2개는 굵게 채썰고, 대파 1/2대는 4cm 길이로 썬다",
      "팬을 중강불로 달구고 기름 없이 양파를 1분 볶는다",
      "재운 소고기를 넣고 강불로 3~4분 볶는다",
      "대파를 넣고 1분 더 볶아 완성"
    ]
  },
  {
    name: "라면",
    cost: 1500, time: 5, difficulty: "쉬움",
    category: ["초저가", "간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shin_Ramyun.jpg/320px-Shin_Ramyun.jpg",
    ingredients: ["라면 1개", "계란 1개", "대파 1/4대", "물 550ml"],
    description: "5분이면 완성되는 한국의 국민 음식. 끓이는 방법만 지키면 더 맛있다.",
    steps: [
      "냄비에 물 550ml를 넣고 강불로 끓인다",
      "물이 끓으면 스프 먼저 넣고 면을 넣는다",
      "면을 젓가락으로 풀어주면서 2분간 끓인다",
      "계란 1개를 깨서 넣고 대파를 어슷썰어 넣는다",
      "30초 후 불을 끄면 완성 (계란은 완숙이 아닌 반숙 상태가 맛있다)"
    ]
  },
  {
    name: "떡볶이",
    cost: 4000, time: 20, difficulty: "쉬움",
    category: ["초저가", "간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Korean_food-Tteokbokki-01.jpg/320px-Korean_food-Tteokbokki-01.jpg",
    ingredients: ["가래떡 200g", "어묵 100g", "고추장 2큰술", "고춧가루 1큰술", "설탕 1큰술", "간장 1큰술", "대파 1/3대", "물 300ml"],
    description: "달콤하고 매콤한 한국의 대표 분식. 쫄깃한 떡과 어묵이 잘 어울린다.",
    steps: [
      "고추장 2큰술, 고춧가루 1큰술, 설탕 1큰술, 간장 1큰술을 섞어 양념장을 만든다",
      "어묵 100g을 3×6cm 직사각형으로 썬다",
      "냄비에 물 300ml와 양념장을 넣고 잘 섞어 중불로 끓인다",
      "끓어오르면 가래떡 200g과 어묵을 넣는다",
      "국물을 끼얹으면서 8~10분간 끓인다 (떡이 부드러워질 때까지)",
      "대파를 어슷썰어 넣고 1분 더 끓여 완성"
    ]
  },
  {
    name: "잡채",
    cost: 9000, time: 40, difficulty: "보통",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Japchae.jpg/320px-Japchae.jpg",
    ingredients: ["당면 150g", "소고기 100g", "시금치 80g", "당근 1/3개", "양파 1/2개", "목이버섯 30g", "계란 1개", "간장 3큰술", "참기름 2큰술", "설탕 1큰술"],
    description: "당면과 각종 채소를 버무린 잔칫날 음식. 명절에 빠질 수 없는 한국 전통 요리.",
    steps: [
      "당면 150g을 끓는 물에 6분간 삶아 찬물에 헹군 뒤 간장 1큰술·참기름 1큰술·설탕 0.5큰술로 미리 버무린다",
      "소고기 100g을 채썰어 간장 1큰술·설탕 0.5큰술·참기름 0.5큰술로 5분 재운다",
      "시금치는 데쳐 물기 짜고 소금·참기름으로 무치고, 당근·양파는 채썬다",
      "목이버섯은 물에 불려 먹기 좋게 뜯는다",
      "팬에 재운 소고기를 중불로 2~3분 볶고, 이어서 당근·양파·목이버섯을 각각 1~2분씩 볶는다",
      "계란 지단을 부쳐 채썬다",
      "큰 볼에 당면과 모든 재료를 넣고 간장·참기름·설탕으로 간하며 버무려 완성"
    ]
  },
  {
    name: "부대찌개",
    cost: 9000, time: 25, difficulty: "쉬움",
    category: ["간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Budae-jjigae_by_jetalone_in_Seoul%2C_Korea.jpg/320px-Budae-jjigae_by_jetalone_in_Seoul%2C_Korea.jpg",
    ingredients: ["햄(스팸) 100g", "소시지 100g", "김치 150g", "두부 100g", "라면사리 1개", "고추장 1큰술", "고춧가루 1큰술", "다진마늘 0.5큰술"],
    description: "햄·소시지·김치를 넣어 끓인 얼큰한 찌개. 혼밥에도 완벽한 한 끼.",
    steps: [
      "햄 100g을 1cm 두께로 썰고 소시지는 어슷썬다",
      "김치 150g을 4cm 길이로 썰고 두부는 2cm 크기로 썬다",
      "냄비 바닥에 김치를 깔고 햄·소시지·두부를 올린다",
      "물 400ml와 고추장 1큰술, 고춧가루 1큰술, 다진마늘 0.5큰술을 넣는다",
      "강불로 끓이다 끓어오르면 중불로 줄인다",
      "라면사리를 넣고 3분 더 끓여 면이 익으면 완성"
    ]
  },
  {
    name: "닭볶음탕",
    cost: 9000, time: 45, difficulty: "보통",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Dak-bokkeum-tang.jpg/320px-Dak-bokkeum-tang.jpg",
    ingredients: ["닭 1/2마리(500g)", "감자 1개", "당근 1/2개", "양파 1/2개", "고추장 2큰술", "간장 2큰술", "설탕 1큰술", "고춧가루 1큰술", "다진마늘 1큰술"],
    description: "닭과 각종 채소를 매콤한 양념에 조린 한국의 인기 메인 요리.",
    steps: [
      "닭을 흐르는 물에 깨끗이 씻고 한입 크기로 토막낸다",
      "끓는 물에 닭을 3분간 데쳐 핏물을 제거하고 건진다",
      "고추장·간장·설탕·고춧가루·다진마늘·물 3큰술로 양념장을 만든다",
      "감자·당근을 3cm 크기로 썰고 양파는 굵게 채썬다",
      "냄비에 닭과 양념장, 물 200ml를 넣고 강불로 끓인다",
      "끓어오르면 감자·당근을 넣고 중불로 15분 조린다",
      "양파를 넣고 10분 더 조려 국물이 자작해지면 완성"
    ]
  },
  {
    name: "미역국",
    cost: 4000, time: 35, difficulty: "쉬움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Miyeok-guk.jpg/320px-Miyeok-guk.jpg",
    ingredients: ["건미역 10g", "소고기(국거리) 100g", "간장 1.5큰술", "참기름 1큰술", "다진마늘 0.5큰술", "소금 약간"],
    description: "생일에 먹는 한국 전통 건강 국. 산모와 아이에게도 좋은 영양식.",
    steps: [
      "건미역 10g을 찬물에 20분간 불려 물기를 짠 뒤 3~4cm 길이로 자른다",
      "냄비에 참기름 1큰술을 두르고 소고기 100g을 중불로 2분 볶는다",
      "불린 미역을 넣고 함께 2분 더 볶는다",
      "물 600ml를 붓고 강불로 끓인다",
      "끓어오르면 간장 1.5큰술, 다진마늘 0.5큰술을 넣고 중불로 줄인다",
      "20~25분간 끓여 미역이 부드러워지면 소금으로 간을 맞춰 완성"
    ]
  },
  {
    name: "해물파전",
    cost: 8000, time: 25, difficulty: "보통",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Pajeon.jpg/320px-Pajeon.jpg",
    ingredients: ["쪽파 150g", "오징어 100g", "새우 100g", "부침가루 150g", "계란 1개", "물 150ml", "식용유 3큰술"],
    description: "쪽파와 해물로 만든 바삭한 전. 막걸리와 환상의 조합.",
    steps: [
      "쪽파 150g을 전의 길이에 맞게 자르고, 오징어와 새우를 한입 크기로 썬다",
      "부침가루 150g, 물 150ml, 계란 1개를 섞어 반죽을 만든다",
      "팬에 식용유 2큰술을 두르고 중강불로 달군다",
      "쪽파를 팬에 넓게 펼치고 해물을 올린다",
      "반죽을 전체적으로 붓고 2~3분간 노릇하게 굽는다",
      "뒤집개로 조심히 뒤집어 나머지 1큰술 기름 두르고 2분 더 굽는다",
      "바삭하게 익으면 먹기 좋은 크기로 잘라 완성"
    ]
  },
  {
    name: "김밥",
    cost: 5000, time: 40, difficulty: "보통",
    category: ["간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Korean_food-Kimbap-01.jpg/320px-Korean_food-Kimbap-01.jpg",
    ingredients: ["밥 300g", "김 3장", "계란 2개", "시금치 100g", "당근 1/3개", "단무지 3줄", "어묵 50g", "참기름 1.5큰술", "소금 약간"],
    description: "소풍·도시락의 정석. 다양한 재료를 김과 밥으로 감싼 한국식 롤.",
    steps: [
      "밥에 참기름 1큰술과 소금 약간을 넣어 고루 섞은 뒤 식힌다",
      "계란 2개를 풀어 소금 넣고 팬에 기름 두르고 얇게 부쳐 채썬다",
      "시금치를 데쳐 물기 짜고 참기름·소금으로 무치고, 당근을 채썰어 볶는다",
      "어묵을 채썰어 간장 약간 넣고 1분 볶는다",
      "김 위에 밥을 얇고 고르게 펴되 위쪽 2cm는 비워둔다",
      "재료들을 밥 아래쪽에 가지런히 올리고 단단하게 말아준다",
      "참기름 약간 바르고 1cm 두께로 썰어 완성"
    ]
  },
  {
    name: "두부조림",
    cost: 4000, time: 20, difficulty: "쉬움",
    category: ["초저가", "건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Dubu-jorim.jpg/320px-Dubu-jorim.jpg",
    ingredients: ["두부 1모(300g)", "간장 2큰술", "고춧가루 1큰술", "다진마늘 0.5큰술", "대파 1/4대", "참기름 0.5큰술", "식용유 2큰술", "설탕 0.5큰술"],
    description: "간장 양념에 노릇하게 조린 두부. 밥 반찬으로 최고인 간편 요리.",
    steps: [
      "두부 300g을 1.5cm 두께로 썰고 키친타월로 물기를 제거한다",
      "간장 2큰술, 고춧가루 1큰술, 다진마늘 0.5큰술, 설탕 0.5큰술, 물 2큰술을 섞어 양념장을 만든다",
      "팬에 식용유 2큰술을 두르고 중강불로 달군다",
      "두부를 넣고 앞뒤로 각 2~3분씩 노릇노릇하게 굽는다",
      "양념장을 붓고 약불로 줄여 1~2분간 조린다",
      "대파를 어슷썰어 올리고 참기름을 뿌려 완성"
    ]
  },
  {
    name: "콩나물국밥",
    cost: 3000, time: 20, difficulty: "쉬움",
    category: ["초저가", "건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Korean_soup_kongnamul_guk.jpg/320px-Korean_soup_kongnamul_guk.jpg",
    ingredients: ["콩나물 200g", "밥 200g", "대파 1/3대", "새우젓 1큰술", "고춧가루 1큰술", "다진마늘 0.5큰술", "계란 1개"],
    description: "숙취 해소에도 좋은 시원하고 건강한 콩나물국밥.",
    steps: [
      "콩나물 200g을 깨끗이 씻어 꼬리를 떼어낸다",
      "냄비에 물 500ml를 넣고 강불로 끓인다",
      "끓어오르면 콩나물을 넣고 뚜껑을 덮어 5분간 끓인다 (뚜껑을 열면 비린내가 남)",
      "새우젓 1큰술, 다진마늘 0.5큰술을 넣고 간을 맞춘다",
      "밥 200g을 넣고 3분 더 끓인다",
      "계란을 풀어 넣고 대파 어슷썰어 넣는다",
      "고춧가루를 취향에 맞게 넣어 완성"
    ]
  },
  {
    name: "볶음우동",
    cost: 5000, time: 15, difficulty: "쉬움",
    category: ["간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Yaki-udon.jpg/320px-Yaki-udon.jpg",
    ingredients: ["냉동우동면 1개(200g)", "양파 1/4개", "당근 1/4개", "대파 1/3대", "간장 1.5큰술", "굴소스 1큰술", "참기름 0.5큰술", "식용유 1큰술"],
    description: "야채와 우동을 간장 소스에 볶은 간편 한 끼.",
    steps: [
      "냉동우동면을 전자레인지에 2분 또는 끓는 물에 1분간 데쳐 풀어놓는다",
      "양파·당근을 채썰고 대파는 어슷썬다",
      "팬에 식용유 1큰술을 두르고 강불로 달군다",
      "양파와 당근을 1~2분간 볶는다",
      "우동면을 넣고 주걱으로 풀면서 2분간 볶는다",
      "간장 1.5큰술, 굴소스 1큰술을 넣고 30초 더 볶는다",
      "대파를 넣고 참기름 뿌려 마무리"
    ]
  },
  {
    name: "삼겹살구이",
    cost: 12000, time: 20, difficulty: "쉬움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samgyeopsal_with_Soju.jpg/320px-Samgyeopsal_with_Soju.jpg",
    ingredients: ["삼겹살 300g", "마늘 10쪽", "쌈채소(상추·깻잎) 100g", "쌈장 2큰술", "소금 약간", "참기름 약간"],
    description: "한국인이 가장 사랑하는 고기 요리. 쌈채소와 쌈장으로 즐기는 별미.",
    steps: [
      "삼겹살을 냉장고에서 꺼내 15분 상온에 둔다",
      "그릴 팬을 강불로 5분간 충분히 달군다",
      "삼겹살을 올리고 앞뒤로 각 3~4분씩 굽는다",
      "마늘은 통으로 함께 구워 노릇해지면 꺼낸다",
      "고기를 한입 크기로 자르고 소금·참기름에 찍어 쌈채소에 싸 먹는다",
      "쌈장을 곁들이면 완성"
    ]
  },
  {
    name: "참치마요덮밥",
    cost: 3000, time: 10, difficulty: "쉬움",
    category: ["초저가", "간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Tuna_mayo_rice_bowl.jpg/320px-Tuna_mayo_rice_bowl.jpg",
    ingredients: ["참치캔 1개(150g)", "마요네즈 2큰술", "간장 1큰술", "밥 200g", "구운 김 2장", "참기름 약간", "대파 약간"],
    description: "참치캔과 마요네즈로 10분 만에 완성하는 간편 덮밥.",
    steps: [
      "참치캔을 열어 기름을 완전히 뺀다 (뚜껑으로 꾹 눌러 짜낸다)",
      "참치에 마요네즈 2큰술, 간장 1큰술을 넣어 잘 섞는다",
      "따뜻한 밥 200g을 그릇에 담는다",
      "참치마요를 밥 위에 올린다",
      "구운 김을 잘게 잘라 위에 뿌린다",
      "참기름 약간, 대파 약간을 올려 완성"
    ]
  },
  {
    name: "계란후라이",
    cost: 1000, time: 5, difficulty: "쉬움",
    category: ["초저가", "간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Sunny_side_up_eggs.jpg/320px-Sunny_side_up_eggs.jpg",
    ingredients: ["계란 2개", "식용유 1큰술", "소금 약간", "후추 약간"],
    description: "가장 간단한 계란 요리. 흰자는 바삭하고 노른자는 촉촉한 반숙이 최고.",
    steps: [
      "팬을 중불로 달구고 식용유 1큰술을 두른다",
      "계란을 조심스럽게 깨서 팬에 넣는다 (높이를 낮춰 깨야 모양이 살아남)",
      "소금·후추를 뿌린다",
      "흰자가 완전히 익고 노른자가 반숙이 될 때까지 2~3분 굽는다",
      "뒤집어 10~15초 익히면 반숙, 1분 더 익히면 완숙 완성"
    ]
  },
  {
    name: "오므라이스",
    cost: 5000, time: 20, difficulty: "보통",
    category: ["간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Omurice.jpg/320px-Omurice.jpg",
    ingredients: ["밥 200g", "계란 3개", "양파 1/4개", "케첩 3큰술", "버터 1큰술", "소금·후추 약간"],
    description: "케첩 볶음밥을 계란으로 감싼 부드러운 요리. 아이들이 특히 좋아하는 메뉴.",
    steps: [
      "양파 1/4개를 잘게 다진다",
      "팬에 버터 0.5큰술을 녹이고 양파를 2분 볶는다",
      "밥 200g을 넣고 케첩 2큰술을 넣어 볶음밥을 만든다 (2~3분)",
      "볶음밥을 그릇에 올려 반원 형태로 만든다",
      "팬에 버터 0.5큰술을 녹이고 계란 3개를 풀어 소금 넣고 약불로 부친다",
      "계란이 반숙 상태일 때 볶음밥 위에 조심히 덮는다",
      "케첩 1큰술을 위에 뿌려 완성"
    ]
  },
  {
    name: "파스타",
    cost: 7000, time: 25, difficulty: "보통",
    category: ["간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_bolognese2.jpg/320px-Spaghetti_bolognese2.jpg",
    ingredients: ["파스타면 100g", "베이컨 3줄", "양파 1/4개", "토마토소스 150g", "마늘 3쪽", "올리브유 2큰술", "소금·후추", "파마산 치즈 약간"],
    description: "토마토소스와 베이컨으로 만든 간단한 이탈리안 파스타.",
    steps: [
      "끓는 물에 소금 1큰술 넣고 파스타면을 봉지 표기 시간보다 1분 적게 삶는다 (알덴테)",
      "베이컨을 1cm 폭으로 자르고 마늘은 편으로 썬다",
      "팬에 올리브유 2큰술을 두르고 마늘을 약불로 1분간 볶아 향을 낸다",
      "베이컨을 넣고 중불로 2분 볶는다",
      "양파를 채썰어 넣고 1분 볶은 뒤 토마토소스 150g을 넣는다",
      "면 삶은 물 3큰술을 넣고 소스를 2분 끓인다",
      "삶은 파스타를 넣고 소스와 잘 섞어 1분 더 볶아 완성"
    ]
  },
  {
    name: "닭갈비",
    cost: 9000, time: 30, difficulty: "보통",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Dak-galbi.jpg/320px-Dak-galbi.jpg",
    ingredients: ["닭다리살 300g", "양파 1/2개", "고추장 2큰술", "간장 1큰술", "설탕 1큰술", "고춧가루 1큰술", "다진마늘 1큰술", "참기름 1큰술"],
    description: "매콤한 양념에 볶은 닭고기 요리. 춘천의 명물이자 전국민 인기 메뉴.",
    steps: [
      "고추장 2큰술, 간장 1큰술, 설탕 1큰술, 고춧가루 1큰술, 다진마늘 1큰술, 생강가루 약간으로 양념장을 만든다",
      "닭다리살 300g을 한입 크기로 썰어 양념장에 30분 재운다",
      "양파 1/2개를 굵게 썬다",
      "팬을 중강불로 달구고 기름을 두른다",
      "재운 닭고기를 넣고 뚜껑 덮어 5분 익힌다",
      "뚜껑 열고 양파를 넣어 함께 3분 더 볶는다",
      "참기름 1큰술 두르고 마무리"
    ]
  },
  {
    name: "수제비",
    cost: 4000, time: 35, difficulty: "보통",
    category: ["초저가", "건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Sujebi.jpg/320px-Sujebi.jpg",
    ingredients: ["밀가루 200g", "감자 1개", "애호박 1/2개", "대파 1/3대", "멸치 20g", "다시마 10g", "간장 1큰술", "소금 약간"],
    description: "밀가루를 반죽해 뜯어 넣은 얼큰하고 구수한 한국 전통 국수.",
    steps: [
      "밀가루 200g에 소금 약간, 물 100ml를 넣어 부드럽게 반죽하고 랩 씌워 20분 휴지시킨다",
      "냄비에 물 1L, 멸치 20g, 다시마 10g을 넣고 10분 끓여 육수를 낸 뒤 건진다",
      "감자 1개를 1.5cm 크기로 깍뚝썰고, 애호박은 반달 썰기한다",
      "육수에 간장 1큰술 넣고 강불로 끓이면서 감자를 먼저 넣는다",
      "5분 후 반죽을 얇게 뜯어 국물에 넣는다 (두께 3~4mm)",
      "수제비가 떠오르면 애호박 넣고 2분 더 끓인다",
      "대파 어슷썰어 넣고 소금으로 간해 완성"
    ]
  },
  {
    name: "갈비탕",
    cost: 12000, time: 90, difficulty: "어려움",
    category: ["건강식"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Galbijjim.jpg/320px-Galbijjim.jpg",
    ingredients: ["소갈비 500g", "무 200g", "대파 1대", "마늘 5쪽", "생강 1쪽", "소금 약간", "후추 약간"],
    description: "진한 사골 육수에 갈비를 넣어 끓인 고급스러운 보양식.",
    steps: [
      "소갈비 500g을 찬물에 2시간 담가 핏물을 제거한다",
      "냄비에 갈비를 넣고 물을 가득 부어 강불로 끓인다",
      "끓어오르면 5분 후 물을 버리고 갈비를 찬물로 씻는다",
      "깨끗한 냄비에 갈비, 물 2L, 무 200g, 대파 1대, 마늘 5쪽, 생강 1쪽을 넣는다",
      "강불로 끓이다 약불로 줄여 60~90분간 충분히 끓인다",
      "무와 파를 건지고 소금·후추로 간을 맞춘다",
      "그릇에 갈비와 국물을 담아 대파 송송 썰어 올려 완성"
    ]
  },
  {
    name: "잔치국수",
    cost: 3000, time: 20, difficulty: "쉬움",
    category: ["초저가", "간편요리"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Janchi-guksu.jpg/320px-Janchi-guksu.jpg",
    ingredients: ["소면 100g", "멸치 20g", "다시마 10g", "계란 1개", "대파 1/4대", "간장 2큰술", "소금 약간", "참기름 0.5큰술"],
    description: "잔칫날 먹던 따뜻한 국수. 깔끔한 멸치 육수에 소면을 넣어 만드는 간단한 음식.",
    steps: [
      "멸치 20g, 다시마 10g을 물 600ml에 넣고 10분 끓여 육수를 내고 건진다",
      "간장 2큰술, 소금으로 육수 간을 맞춘다",
      "소면 100g을 끓는 물에 3~4분 삶아 찬물에 헹군다",
      "계란 1개를 삶거나 지단을 부쳐 채썬다",
      "그릇에 소면을 담고 뜨거운 육수를 붓는다",
      "계란 지단과 대파를 얹고 참기름을 뿌려 완성"
    ]
  }
];

// ---- 공통 API 호출 ----
async function apiCall(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API 오류");
  return data;
}

// 외부 검색 링크
function externalSearchLinks(query) {
  const q = encodeURIComponent(query);
  return `<div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
    <a href="https://www.10000recipe.com/recipe/list.html?q=${q}" target="_blank" rel="noopener" class="btn" style="font-size:0.85rem;">만개의레시피에서 검색</a>
    <a href="https://search.naver.com/search.naver?query=${q}+레시피" target="_blank" rel="noopener" class="btn" style="font-size:0.85rem;">네이버에서 검색</a>
  </div>`;
}

// 레시피 카드 HTML (Naver 이미지 API 사용)
function recipeCard(r) {
  const steps   = r.steps.map((s, i) => `<li style="margin-bottom:6px; line-height:1.6;">${i + 1}. ${escapeHtml(s)}</li>`).join("");
  const ingList = r.ingredients.map(i => `<li style="margin-bottom:3px;">${escapeHtml(i)}</li>`).join("");
  return `<article class="ai-summary-card" style="margin-bottom:16px;">
    <h3 style="margin-bottom:6px;">${escapeHtml(r.name)}</h3>
    <p style="color:#5a6455; font-size:0.9rem; margin-bottom:10px;">${escapeHtml(r.description)}</p>
    <p style="font-size:0.9rem; margin-bottom:6px;">
      예상 재료비: <strong>${r.cost.toLocaleString()}원</strong> (2인분) &nbsp;|&nbsp; 조리 시간: <strong>${r.time}분</strong> &nbsp;|&nbsp; 난이도: <strong>${escapeHtml(r.difficulty)}</strong>
    </p>
    <details style="font-size:0.88rem; color:#3d5230; margin-bottom:6px;">
      <summary style="cursor:pointer; font-weight:600; margin-bottom:4px;">재료 보기</summary>
      <ul style="margin:6px 0 0; padding-left:16px; line-height:1.8;">${ingList}</ul>
    </details>
    <details style="font-size:0.88rem; color:#3d5230;">
      <summary style="cursor:pointer; font-weight:600; margin-bottom:4px;">조리 순서 보기</summary>
      <ol style="margin:6px 0 0; padding-left:16px; line-height:1.8;">${steps}</ol>
    </details>
  </article>`;
}

// ============================================
// 페이지 라우터
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // 로그인 상태면 네비게이션의 로그인/회원가입 링크 숨기기
  const navLoginLink = document.querySelector('nav.nav a[href*="login"]');
  if (navLoginLink && getToken()) navLoginLink.style.display = "none";

  const path = window.location.pathname.toLowerCase();
  if      (path.includes("login"))      initLogin();
  else if (path.includes("recommend"))  initRecommend();
  else if (path.includes("ingredient")) initIngredients();
  else if (path.includes("search"))     initSearch();
  else if (path.includes("settings"))   initSettings();
  else if (path.includes("recipe"))     initRecipeDetail();
});

// ============================================
// 로그인 페이지
// ============================================
function initLogin() {
  const loginForm  = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const notice     = document.getElementById("authNotice");
  const status     = document.getElementById("authStatus");
  const loginTab   = document.getElementById("showLoginBtn");
  const signupTab  = document.getElementById("showSignupBtn");
  const logoutBtn  = document.getElementById("logoutBtn");
  if (!loginForm || !signupForm) return;

  const showNotice = (msg, isError) => {
    notice.textContent = msg;
    notice.style.display = "block";
    notice.style.background = isError ? "#fce8e3" : "#eef6e7";
    notice.style.color      = isError ? "#7a3425" : "#2f4b21";
  };

  const switchTab = (target) => {
    const isLogin = target === "login";
    loginForm.style.display  = isLogin ? "grid" : "none";
    signupForm.style.display = isLogin ? "none" : "grid";
    loginTab.classList.toggle("active",  isLogin);
    signupTab.classList.toggle("active", !isLogin);
  };

  const renderStatus = async () => {
    // 로그인 상태 표시 패널은 항상 숨김
    if (status) status.style.display = "none";
    const token = getToken();
    if (!token) {
      if (logoutBtn) logoutBtn.style.display = "none";
      switchTab("login");
      return;
    }
    try {
      const res = await apiCall("/user/me");
      setUser(res.user);
      if (logoutBtn) logoutBtn.style.display = "inline-flex";
    } catch {
      clearAuth();
      if (logoutBtn) logoutBtn.style.display = "none";
      switchTab("login");
    }
  };

  // OAuth 콜백 처리 (?token= 또는 ?error=)
  const params     = new URLSearchParams(window.location.search);
  const oauthToken = params.get("token");
  const oauthError = params.get("error");
  if (oauthToken) {
    setToken(oauthToken);
    window.history.replaceState({}, "", window.location.pathname);
    showNotice("소셜 로그인 성공! 홈으로 이동합니다...", false);
    setTimeout(() => { window.location.href = "../index.html"; }, 900);
    return;
  } else if (oauthError) {
    showNotice(decodeURIComponent(oauthError), true);
    window.history.replaceState({}, "", window.location.pathname);
  }

  // 소셜 로그인 버튼 — 기존 세션 삭제 후 OAuth 이동
  document.querySelectorAll(".social[data-provider]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuth(); // 기존 로그인 정보 초기화
      const provider = btn.getAttribute("data-provider");
      window.location.href = `${API}/auth/${provider}`;
    });
  });

  loginTab.addEventListener("click",  () => switchTab("login"));
  signupTab.addEventListener("click", () => switchTab("signup"));

  // 일반 로그인
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    const pw = document.getElementById("loginPassword").value;
    if (!id || !pw) { showNotice("아이디와 비밀번호를 입력해주세요.", true); return; }
    try {
      const res = await apiCall("/auth/login", { method: "POST", body: JSON.stringify({ id, password: pw }) });
      setToken(res.token);
      setUser(res.user);
      document.getElementById("loginId").value = "";
      document.getElementById("loginPassword").value = "";
      showNotice("로그인 성공! 홈으로 이동합니다...", false);
      setTimeout(() => { window.location.href = "../index.html"; }, 900);
    } catch (err) { showNotice(err.message, true); }
  });

  // 회원가입
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id  = document.getElementById("signupId").value.trim();
    const pw  = document.getElementById("signupPassword").value;
    const pw2 = document.getElementById("signupPasswordConfirm").value;
    if (!id || id.length < 4) { showNotice("아이디는 4자 이상이어야 합니다.", true); return; }
    if (pw.length < 4) { showNotice("비밀번호는 4자 이상이어야 합니다.", true); return; }
    if (pw !== pw2) { showNotice("비밀번호가 일치하지 않습니다.", true); return; }
    try {
      const res = await apiCall("/auth/signup", {
        method: "POST", body: JSON.stringify({ id, password: pw, passwordConfirm: pw2 })
      });
      setToken(res.token);
      setUser(res.user);
      showNotice("회원가입 완료! 홈으로 이동합니다...", false);
      setTimeout(() => { window.location.href = "../index.html"; }, 900);
    } catch (err) { showNotice(err.message, true); }
  });

  // 로그아웃
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      showNotice("로그아웃되었습니다.", false);
      renderStatus();
    });
  }

  renderStatus();
}

// ============================================
// 메뉴 추천 페이지
// ============================================
function initRecommend() {
  const minBudgetRec      = document.getElementById("minBudgetRec");
  const maxBudgetRec      = document.getElementById("maxBudgetRec");
  const recommendAiBtn    = document.getElementById("recommendAiBtn");
  const askAiMenuBtn      = document.getElementById("askAiMenuBtn");
  const aiMenuPrompt      = document.getElementById("aiMenuPrompt");
  const recommendAiResult = document.getElementById("recommendAiResult");
  const recommendAiMeta   = document.getElementById("recommendAiMeta");
  const recommendList     = document.getElementById("recommendList");

  const savedBudget = parseInt(localStorage.getItem("mealfit_budget") || "150000");
  if (maxBudgetRec && !maxBudgetRec.value) {
    maxBudgetRec.value = Math.min(30000, savedBudget);
  }

  const params         = new URLSearchParams(window.location.search);
  const ingredientMode = params.get("mode") === "ingredients";

  if (ingredientMode) {
    const myIngredients = JSON.parse(localStorage.getItem("mealfit_ingredients") || "[]");
    if (!myIngredients.length) {
      if (recommendAiResult) recommendAiResult.innerHTML = '<p class="notice">재료관리 탭에서 보유 재료를 먼저 등록해주세요.</p>';
    } else {
      runIngredientBasedRecommend(myIngredients, recommendAiResult, recommendAiMeta, recommendList);
    }
  } else {
    const minB = parseInt(minBudgetRec?.value || "0");
    const maxB = parseInt(maxBudgetRec?.value || "30000");
    runBudgetRecommend(minB, maxB, recommendAiResult, recommendAiMeta, recommendList);
  }

  if (recommendAiBtn) {
    recommendAiBtn.addEventListener("click", () => {
      const minB = parseInt(minBudgetRec?.value || "0");
      const maxB = parseInt(maxBudgetRec?.value || "30000");
      runBudgetRecommend(minB, maxB, recommendAiResult, recommendAiMeta, recommendList);
    });
  }

  if (askAiMenuBtn) {
    askAiMenuBtn.addEventListener("click", () => {
      const keyword = aiMenuPrompt?.value.trim();
      if (!keyword) { alert("검색할 키워드를 입력해주세요."); return; }
      const results = RECIPE_DB.filter(r =>
        r.name.includes(keyword) ||
        r.description.includes(keyword) ||
        r.ingredients.some(i => i.includes(keyword))
      );
      if (results.length) {
        if (recommendAiResult) recommendAiResult.innerHTML = results.map(recipeCard).join("");
        if (recommendAiMeta) recommendAiMeta.textContent = `"${keyword}" 검색 결과 ${results.length}개`;
      } else {
        if (recommendAiResult) recommendAiResult.innerHTML =
          `<p class="notice">"${escapeHtml(keyword)}" 관련 레시피를 찾지 못했습니다.</p>${externalSearchLinks(keyword + " 레시피")}`;
        if (recommendAiMeta) recommendAiMeta.textContent = `"${keyword}" 검색 결과 없음`;
      }
    });
  }
}

function runBudgetRecommend(minBudget, maxBudget, resultEl, metaEl, listEl) {
  if (!resultEl) return;
  if (listEl) listEl.innerHTML = "";
  const filtered = RECIPE_DB.filter(r => r.cost >= minBudget && r.cost <= maxBudget).sort((a, b) => a.cost - b.cost);
  if (!filtered.length) {
    resultEl.innerHTML = '<p class="notice">해당 예산 범위에 맞는 레시피가 없습니다.</p>';
    if (metaEl) metaEl.textContent = "결과 없음";
    return;
  }
  const rangeText = minBudget > 0
    ? `${minBudget.toLocaleString()}원 ~ ${maxBudget.toLocaleString()}원`
    : `${maxBudget.toLocaleString()}원 이하`;
  resultEl.innerHTML =
    `<p style="margin-bottom:12px; color:#5a6455; font-size:0.9rem;">예산 <strong>${rangeText}</strong> 메뉴 <strong>${filtered.length}개</strong></p>` +
    filtered.map(recipeCard).join("");
  if (metaEl) metaEl.textContent = `${rangeText} ${filtered.length}개 검색됨`;
}

function runIngredientBasedRecommend(ingredients, resultEl, metaEl, listEl) {
  if (!resultEl) return;
  if (listEl) listEl.innerHTML = "";
  const scored = RECIPE_DB.map(r => {
    const matched = r.ingredients.filter(ing =>
      ingredients.some(u => u.includes(ing.split(" ")[0]) || ing.includes(u))
    );
    return { ...r, matchCount: matched.length, matchedIngredients: matched };
  }).filter(r => r.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);

  if (!scored.length) {
    resultEl.innerHTML = '<p class="notice">보유 재료와 매칭되는 레시피가 없습니다. 재료를 더 추가해보세요.</p>';
    if (metaEl) metaEl.textContent = "매칭 결과 없음";
    return;
  }
  resultEl.innerHTML = scored.map(r => {
    return recipeCard(r).replace(
      "</article>",
      `<p style="font-size:0.82rem; color:#4a7a35; margin:8px 0 0; padding:6px; background:#f0f7eb; border-radius:6px;">매칭 재료: ${r.matchedIngredients.map(escapeHtml).join(", ")} (${r.matchCount}개)</p></article>`
    );
  }).join("");
  if (metaEl) metaEl.textContent = `보유 재료 기반 ${scored.length}개 메뉴 검색됨`;
}

// ============================================
// 재료관리 페이지
// ============================================
function initIngredients() {
  const ingredientInput  = document.getElementById("ingredientInput");
  const addIngredientBtn = document.getElementById("addIngredientBtn");
  const clearIngBtn      = document.getElementById("clearIngredientBtn");
  const ingredientList   = document.getElementById("ingredientList");
  const shoppingInput    = document.getElementById("shoppingInput");
  const addShoppingBtn   = document.getElementById("addShoppingBtn");
  const clearShopBtn     = document.getElementById("clearShoppingBtn");
  const shoppingList     = document.getElementById("shoppingList");

  let ingredients = JSON.parse(localStorage.getItem("mealfit_ingredients") || "[]");
  let shopping    = JSON.parse(localStorage.getItem("mealfit_shopping") || "[]");

  const saveIng  = () => localStorage.setItem("mealfit_ingredients", JSON.stringify(ingredients));
  const saveShop = () => localStorage.setItem("mealfit_shopping", JSON.stringify(shopping));

  const renderIng = () => {
    if (!ingredientList) return;
    if (!ingredients.length) {
      ingredientList.innerHTML = '<li style="color:#6b7565; font-size:0.9rem; list-style:none; padding:8px 0;">등록된 재료가 없습니다.</li>';
      return;
    }
    ingredientList.innerHTML = ingredients.map((item, i) => `
      <li class="managed-item">
        <div class="managed-check">
          <span class="item-text">${escapeHtml(item)}</span>
          <button class="btn ghost" style="padding:4px 10px; font-size:0.8rem;" onclick="window._delIng(${i})">삭제</button>
        </div>
      </li>`).join("");
  };

  const renderShop = () => {
    if (!shoppingList) return;
    if (!shopping.length) {
      shoppingList.innerHTML = '<li style="color:#6b7565; font-size:0.9rem; list-style:none; padding:8px 0;">장보기 리스트가 비어있습니다.</li>';
      return;
    }
    shoppingList.innerHTML = shopping.map((item, i) => `
      <li class="managed-item ${item.done ? "completed" : ""}">
        <div class="managed-check">
          <input class="item-check" type="checkbox" ${item.done ? "checked" : ""} onchange="window._toggleShop(${i})"/>
          <span class="item-text">${escapeHtml(item.text)}</span>
          <button class="btn ghost" style="padding:4px 10px; font-size:0.8rem;" onclick="window._delShop(${i})">삭제</button>
        </div>
      </li>`).join("");
  };

  window._delIng     = (i) => { ingredients.splice(i, 1); saveIng(); renderIng(); };
  window._toggleShop = (i) => { shopping[i].done = !shopping[i].done; saveShop(); renderShop(); };
  window._delShop    = (i) => { shopping.splice(i, 1); saveShop(); renderShop(); };

  const addIng = () => {
    const v = ingredientInput?.value.trim();
    if (!v) { alert("재료명을 입력해주세요."); return; }
    ingredients.push(v); saveIng(); renderIng();
    if (ingredientInput) { ingredientInput.value = ""; ingredientInput.focus(); }
  };
  const addShop = () => {
    const v = shoppingInput?.value.trim();
    if (!v) { alert("재료를 입력해주세요."); return; }
    shopping.push({ text: v, done: false }); saveShop(); renderShop();
    if (shoppingInput) { shoppingInput.value = ""; shoppingInput.focus(); }
  };

  if (addIngredientBtn) addIngredientBtn.addEventListener("click", addIng);
  if (ingredientInput)  ingredientInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addIng(); } });
  if (clearIngBtn) clearIngBtn.addEventListener("click", () => {
    if (!ingredients.length || confirm("보유 재료를 전체 초기화하시겠습니까?")) { ingredients = []; saveIng(); renderIng(); }
  });
  if (addShoppingBtn) addShoppingBtn.addEventListener("click", addShop);
  if (shoppingInput)  shoppingInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addShop(); } });
  if (clearShopBtn) clearShopBtn.addEventListener("click", () => {
    if (!shopping.length || confirm("장보기 리스트를 전체 초기화하시겠습니까?")) { shopping = []; saveShop(); renderShop(); }
  });

  const recBtn = document.querySelector('a[href="recommend.html"]');
  if (recBtn) {
    recBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "recommend.html?mode=ingredients";
    });
  }

  renderIng();
  renderShop();
}

// ============================================
// 레시피 검색 페이지
// ============================================
function initSearch() {
  const searchBtn      = document.getElementById("searchBtn");
  const foodName       = document.getElementById("foodName");
  const minBudget      = document.getElementById("minBudget");
  const maxBudget      = document.getElementById("maxBudget");
  const categoryChips  = document.getElementById("categoryChips");
  const searchAiResult = document.getElementById("searchAiResult");
  const searchAiMeta   = document.getElementById("searchAiMeta");
  const searchResult   = document.getElementById("searchResult");

  let selectedCategory = "전체";

  if (categoryChips) {
    categoryChips.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-category]");
      if (!chip) return;
      categoryChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedCategory = chip.dataset.category;
    });
  }

  const doSearch = async () => {
    const name = foodName?.value.trim() || "";
    const min  = parseInt(minBudget?.value || "0");
    const max  = parseInt(maxBudget?.value || "100000");
    if (!name) { alert("검색할 음식 이름을 입력해주세요."); return; }

    if (searchResult) searchResult.innerHTML = "";
    if (searchAiMeta) searchAiMeta.textContent = "검색 중...";
    if (searchAiResult) searchAiResult.innerHTML = `<p style="color:#5a6455; padding:12px;">검색 중입니다...</p>`;

    // 1. 정적 DB 검색
    let localResults = RECIPE_DB.filter(r =>
      r.name.includes(name) ||
      r.description.includes(name) ||
      r.ingredients.some(i => i.includes(name))
    ).filter(r => r.cost >= min && r.cost <= max);

    if (selectedCategory !== "전체") {
      localResults = localResults.filter(r => r.category.includes(selectedCategory));
    }

    // 2. 네이버 블로그 검색 (병렬)
    let webHtml = "";
    try {
      const res  = await fetch(`${API}/search/recipes?q=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success && data.items.length > 0) {
        const cards = data.items.map(item => `
          <a href="${item.link}" target="_blank" rel="noopener"
            style="display:block; text-decoration:none; padding:12px; border:1px solid #dde8d4; border-radius:10px; margin-bottom:10px; background:#fff; transition:box-shadow .15s;"
            onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,.1)'" onmouseout="this.style.boxShadow=''">
            <p style="font-weight:700; color:#2f4b21; margin:0 0 4px;">${escapeHtml(item.title)}</p>
            <p style="font-size:0.85rem; color:#5a6455; margin:0 0 6px; line-height:1.5;">${escapeHtml(item.description)}</p>
            <span style="font-size:0.78rem; color:#7a8c72;">${escapeHtml(item.bloggerName)} · ${item.date}</span>
          </a>`).join("");
        webHtml = `
          <div style="margin-top:20px; border-top:2px solid #e0ead6; padding-top:16px;">
            <h3 style="margin-bottom:12px; font-size:1.05rem;">🔍 웹 검색 결과 (네이버 블로그)</h3>
            ${cards}
          </div>`;
      }
    } catch { /* 검색 API 실패 시 조용히 무시 */ }

    // 결과 표시
    if (localResults.length > 0 || webHtml) {
      const localHtml = localResults.length > 0
        ? `<p style="margin-bottom:12px; color:#5a6455; font-size:0.9rem;">"${escapeHtml(name)}" 레시피 <strong>${localResults.length}개</strong></p>` +
          localResults.map(recipeCard).join("")
        : "";
      searchAiResult.innerHTML = localHtml + webHtml;
      if (searchAiMeta) searchAiMeta.textContent = `로컬 ${localResults.length}개 + 웹 검색 결과`;
    } else {
      searchAiResult.innerHTML =
        `<p class="notice">"${escapeHtml(name)}" 검색 결과가 없습니다.</p>
         ${externalSearchLinks(name + " 레시피")}`;
      if (searchAiMeta) searchAiMeta.textContent = `"${name}" 검색 결과 없음`;
    }
  };

  if (searchBtn) searchBtn.addEventListener("click", doSearch);
  if (foodName)  foodName.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
}

// ============================================
// 레시피 상세 페이지 (recipe.html)
// ============================================
function initRecipeDetail() {
  const titleEl  = document.getElementById("detailTitle");
  const noteEl   = document.getElementById("detailAiNote");
  const resultEl = document.getElementById("detailAiResult");

  const params = new URLSearchParams(window.location.search);
  const menu   = params.get("menu") || "";

  if (!menu) {
    if (noteEl) { noteEl.textContent = "메뉴 정보가 없습니다. 검색 페이지로 돌아가세요."; noteEl.style.display = "block"; }
    return;
  }

  if (titleEl) titleEl.textContent = menu;

  const recipe = RECIPE_DB.find(r => r.name === menu || r.name.includes(menu) || menu.includes(r.name));

  if (recipe) {
    if (noteEl) noteEl.style.display = "none";
    if (resultEl) {
      const imgHtml = recipe.image
        ? `<img src="${recipe.image}" alt="${escapeHtml(recipe.name)}"
             style="width:100%; max-height:280px; object-fit:cover; border-radius:12px; margin-bottom:16px;"
             onerror="this.style.display='none'" />`
        : "";
      const steps = recipe.steps.map((s, i) => `<li style="margin-bottom:8px; line-height:1.7;">${i + 1}. ${escapeHtml(s)}</li>`).join("");
      const ingList = recipe.ingredients.map(i => `<li style="margin-bottom:4px;">${escapeHtml(i)}</li>`).join("");
      resultEl.innerHTML = `
        <article class="ai-summary-card">
          ${imgHtml}
          <h3>${escapeHtml(recipe.name)} 레시피 상세</h3>
          <div style="line-height:1.9; margin-top:10px;">
            <p><strong>조리 시간:</strong> ${recipe.time}분 &nbsp;|&nbsp; <strong>난이도:</strong> ${escapeHtml(recipe.difficulty)}</p>
            <p><strong>2인분 예상 재료비:</strong> 약 ${recipe.cost.toLocaleString()}원 &nbsp;|&nbsp; <strong>1인분:</strong> 약 ${Math.round(recipe.cost / 2).toLocaleString()}원</p>
            <details open style="margin-top:12px; font-size:0.9rem;">
              <summary style="cursor:pointer; font-weight:700; margin-bottom:6px; font-size:1rem;">필요 재료 (2인분)</summary>
              <ul style="padding-left:18px; margin:6px 0;">${ingList}</ul>
            </details>
            <details open style="margin-top:12px; font-size:0.9rem;">
              <summary style="cursor:pointer; font-weight:700; margin-bottom:6px; font-size:1rem;">조리 순서</summary>
              <ol style="padding-left:18px; margin:6px 0;">${steps}</ol>
            </details>
          </div>
          ${externalSearchLinks(recipe.name + " 레시피")}
        </article>`;
    }
  } else {
    if (noteEl) { noteEl.textContent = `"${menu}" 레시피 정보가 없습니다.`; noteEl.style.display = "block"; }
    if (resultEl) {
      resultEl.innerHTML = `
        <p class="notice">"${escapeHtml(menu)}" 레시피를 데이터베이스에서 찾지 못했습니다.</p>
        ${externalSearchLinks(menu + " 레시피")}`;
    }
  }
}

// ============================================
// 설정 페이지
// ============================================
function initSettings() {
  const accountEl   = document.getElementById("settingsAccountSummary");
  const logoutBtn   = document.getElementById("settingsLogoutBtn");
  const budgetInput = document.getElementById("monthlyBudget");
  const saveBudget  = document.getElementById("saveBudgetBtn");
  const budgetText  = document.getElementById("saveBudgetText");

  const saved = parseInt(localStorage.getItem("mealfit_budget") || "150000");
  if (budgetInput) budgetInput.value = saved;
  if (budgetText)  budgetText.textContent = `현재 월 예산: ${saved.toLocaleString()}원`;

  const renderAccount = async () => {
    const token = getToken();
    if (!token) {
      if (accountEl) accountEl.innerHTML = `<div class="notice" style="display:block;"><p style="margin:0;">로그인이 필요합니다. <a href="login.html" style="color:var(--brand-dark); font-weight:700;">로그인하기</a></p></div>`;
      if (logoutBtn) logoutBtn.style.display = "none";
      return;
    }
    try {
      const res  = await apiCall("/user/me");
      const user = res.user;
      setUser(user);
      if (logoutBtn) logoutBtn.style.display = "inline-flex";
      if (accountEl) accountEl.innerHTML = `
        <article class="account-summary-card">
          <h3>계정 정보</h3>
          <div class="account-summary-grid">
            <div><span>아이디</span><strong>${escapeHtml(user.id)}</strong></div>
            <div><span>이름</span><strong>${escapeHtml(user.name || "미설정")}</strong></div>
            <div><span>가입 유형</span><strong>${escapeHtml(user.loginType)}</strong></div>
          </div>
        </article>`;

      if (user.settings?.monthlyBudget) {
        const serverBudget = user.settings.monthlyBudget;
        localStorage.setItem("mealfit_budget", serverBudget.toString());
        if (budgetInput) budgetInput.value = serverBudget;
        if (budgetText)  budgetText.textContent = `현재 월 예산: ${serverBudget.toLocaleString()}원`;
      }
    } catch {
      clearAuth();
      if (accountEl) accountEl.innerHTML = `<div class="notice" style="display:block;"><p style="margin:0;">세션이 만료되었습니다. <a href="login.html" style="color:var(--brand-dark); font-weight:700;">로그인하기</a></p></div>`;
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  };

  if (saveBudget) {
    saveBudget.addEventListener("click", async () => {
      const budget = parseInt(budgetInput?.value || "0");
      if (isNaN(budget) || budget < 0) { alert("올바른 예산을 입력해주세요."); return; }
      localStorage.setItem("mealfit_budget", budget.toString());
      if (budgetText) budgetText.textContent = `현재 월 예산: ${budget.toLocaleString()}원`;

      const token = getToken();
      if (token) {
        try {
          await apiCall("/user/me", { method: "PATCH", body: JSON.stringify({ monthlyBudget: budget }) });
        } catch { /* 서버 저장 실패해도 로컬은 저장됨 */ }
      }
      alert(`월 예산이 ${budget.toLocaleString()}원으로 저장되었습니다.`);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      renderAccount();
      alert("로그아웃되었습니다.");
    });
  }

  renderAccount();
}
