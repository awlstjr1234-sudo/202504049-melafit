# Meal Fit

예산과 보유 재료를 기반으로 레시피를 추천하는 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router), React 18 |
| 스타일 | CSS (globals.css) |
| 백엔드 | Node.js, Express |
| 데이터베이스 | MongoDB |
| 배포 | Vercel (프론트) / Render (백엔드) |

## 페이지 구성

| URL | 설명 |
|-----|------|
| `/` | 메인 홈 |
| `/login` | 로그인 / 회원가입 |
| `/search` | 레시피 검색 |
| `/recommend` | 메뉴 추천 |
| `/recipe` | 레시피 상세 |
| `/ingredients` | 재료 관리 |
| `/settings` | 설정 (마이페이지) |

## 프로젝트 구조

```
app/                  # Next.js App Router 페이지
├── layout.jsx        # 공통 레이아웃 (헤더 포함)
├── globals.css       # 전역 스타일
├── page.jsx          # 홈 (/)
├── login/page.jsx    # 로그인
├── search/page.jsx   # 레시피 검색
├── recommend/page.jsx# 메뉴 추천
├── ingredients/page.jsx # 재료관리
├── settings/page.jsx # 설정
└── recipe/page.jsx   # 레시피 상세

components/
├── Header.jsx        # 네비게이션 헤더
└── RecipeCard.jsx    # 레시피 카드 컴포넌트

lib/
├── auth.js           # 인증 · API 호출 유틸리티
└── recipeDb.js       # 레시피 정적 데이터베이스

backend/              # Express 백엔드 서버
```

## 로컬 실행 방법

### 프론트엔드 (Next.js)

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 백엔드 (Express)

```bash
cd backend
npm install
npm start
```

## 구현된 기능

- **레시피 검색**: 음식명·예산·카테고리 필터로 로컬 DB 및 네이버 블로그 검색
- **메뉴 추천**: 예산 범위별 추천 및 키워드 검색
- **재료 관리**: 보유 재료 등록·삭제, 장보기 리스트 관리 (localStorage)
- **레시피 상세**: 재료·조리 순서·예상 재료비 표시
- **로그인/회원가입**: 아이디 로그인 및 카카오·네이버·구글 소셜 로그인
- **설정**: 월 예산 설정, 계정 정보 확인

## Next.js 주요 활용 기능

- **App Router**: `app/` 디렉토리 파일 위치로 URL 자동 라우팅
- **Server Component**: 정적 페이지(`/`)는 서버에서 렌더링
- **Client Component**: `'use client'` 지시어로 상태·이벤트가 필요한 페이지 구분
- **`next/link`**: 클라이언트 사이드 페이지 이동 (새로고침 없음)
- **`useRouter`**: 로그인 성공 후 코드로 페이지 이동
- **`usePathname`**: 현재 경로 감지로 네비게이션 active 상태 처리
- **`metadata` API**: 페이지 title · description 자동 관리

## 백엔드 환경 변수

`backend/.env` 파일에 다음 값을 설정해야 합니다:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/mealfit
JWT_SECRET=비밀키
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 소셜 로그인 리디렉션 URI

| 제공자 | URI |
|--------|-----|
| 카카오 | `http://localhost:5000/api/auth/kakao/callback` |
| 네이버 | `http://localhost:5000/api/auth/naver/callback` |
| 구글 | `http://localhost:5000/api/auth/google/callback` |

## 디버깅

백엔드 상태 확인: `http://localhost:5000/api/auth/status`
