# YUON Client

채널톡 스타일 AI RAG 챗봇 시스템의 Next.js 클라이언트 애플리케이션

## 🚀 기술 스택

- **프레임워크**: Next.js 16.0.7 (App Router)
- **언어**: TypeScript 5
- **UI 라이브러리**: React 19.2.0
- **스타일링**: Tailwind CSS 4.1.9
- **UI 컴포넌트**: Radix UI
- **차트**: Recharts 2.15.4
- **폼 관리**: React Hook Form + Zod
- **아이콘**: Lucide React
- **알림**: Sonner

## 📁 프로젝트 구조

```
client/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 메인 페이지 (챗봇 데모)
│   ├── layout.tsx                # 루트 레이아웃
│   └── admin/                    # 관리자 패널
│       ├── page.tsx              # 대시보드
│       ├── documents/            # 문서 관리
│       ├── analytics/            # 분석
│       ├── vectors/              # 벡터 DB 시각화
│       ├── conversations/        # 대화 내역
│       └── users/                # 사용자 관리
├── components/
│   ├── chatbot/                  # 챗봇 컴포넌트
│   │   └── chat-widget.tsx       # 메인 챗봇 위젯
│   └── admin/                    # 관리자 컴포넌트들
├── hooks/                        # 커스텀 훅
│   ├── useChat.ts                # 챗 로직
│   └── useChatRooms.ts           # 대화방 관리
├── lib/
│   ├── types.ts                  # 타입 정의
│   ├── constants.ts              # 상수
│   ├── utils.ts                  # 유틸리티
│   ├── env.ts                    # 환경 변수
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts             # HTTP 클라이언트
│   │   └── endpoints.ts          # API 엔드포인트
│   └── mock/                     # Mock 데이터
│       ├── documents.ts
│       ├── vectors.ts
│       └── analytics.ts
└── public/                       # 정적 파일
```

## 🛠 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/v1/ws
NEXT_PUBLIC_APP_ENV=development
```

> `.env.local.example` 파일을 참고하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📦 주요 기능

### 1. 챗봇 위젯 (`/`)

- 채널톡 스타일의 플로팅 챗봇
- 실시간 메시지 교환
- 타이핑 인디케이터
- 피드백 시스템 (👍/👎)
- 대화방 관리 (생성, 수정, 삭제)
- 빠른 답장 버튼

### 2. 관리자 대시보드 (`/admin`)

- 통계 카드 (문서 수, 대화 수, 사용자, 응답 시간)
- 인터랙티브 차트 (월별 추이, 카테고리 분포)
- 위젯 커스터마이징 (드래그 앤 드롭)
- 실시간 시스템 상태

### 3. 문서 관리 (`/admin/documents`)

- 문서 목록 조회 (검색, 필터링)
- 파일 업로드 (PDF, DOCX, HWP, TXT)
- 문서 CRUD
- 원본 파일 다운로드

### 4. 벡터 DB 시각화 (`/admin/vectors`)

- 2D 벡터 투영 시각화
- 인터랙티브 캔버스 (호버, 클릭)
- 유사도 분석
- 재인덱싱 기능

### 5. 분석 (`/admin/analytics`)

- 일별/시간대별 대화 통계
- 질문 유형 분포 (파이 차트)
- LLM 기반 지식 격차 분석

## 🔧 API 연동

### API 클라이언트 사용법

```typescript
import { apiClient } from "@/lib/api/client"
import { documentApi, authApi } from "@/lib/api/endpoints"

// 인증
const { data } = await authApi.login("user@example.com", "password")
apiClient.setAuthToken(data.token)

// 문서 조회
const documents = await documentApi.list({ page: 1, pageSize: 20 })

// 파일 업로드
const file = new File(["content"], "test.pdf")
await documentApi.upload(file, { category: "기술" })
```

### WebSocket 연결 (예정)

```typescript
const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  // Handle message
}
```

## 🎨 스타일 가이드

### 컬러 팔레트 (다크 테마)

```css
/* 배경 */
bg-[#09090b]  /* 메인 배경 */
bg-[#0c0c0e]  /* 사이드바 */
bg-[#18181b]  /* 카드 */

/* 테두리 */
border-[#1f1f23]  /* 메인 */
border-[#27272a]  /* 서브 */

/* 텍스트 */
text-white       /* 제목 */
text-[#a1a1aa]  /* 본문 */
text-[#71717a]  /* 비활성 */
text-[#52525b]  /* 힌트 */

/* 강조 */
bg-blue-600     /* 주요 버튼 */
text-blue-500   /* 링크/아이콘 */
```

### 타이포그래피

- 제목: 15-20px, font-semibold
- 본문: 13px
- 캡션: 11-12px

## 🧪 테스트

```bash
# 린트 검사
npm run lint
```

## 📝 개발 가이드

### 새로운 컴포넌트 추가

1. `components/` 디렉토리에 컴포넌트 생성
2. 타입은 `lib/types.ts`에 정의
3. 상수는 `lib/constants.ts`에 추가
4. API는 `lib/api/endpoints.ts`에 정의

### 커스텀 훅 작성

1. `hooks/` 디렉토리에 훅 생성
2. `use` 접두사 사용
3. TypeScript 타입 완전히 지정

### Mock 데이터 사용

개발 중에는 `lib/mock/` 디렉토리의 데이터를 사용합니다.

```typescript
import { mockDocuments } from "@/lib/mock/documents"
import { mockVectorDocs } from "@/lib/mock/vectors"
```

## 🚀 배포

### Vercel 배포

```bash
npm run build
```

### 환경 변수 설정

프로덕션 환경 변수를 Vercel 대시보드에서 설정:

- `NEXT_PUBLIC_API_URL`: https://yuon-api.dsmhs.kr/api/v1
- `NEXT_PUBLIC_WS_URL`: wss://yuon-api.dsmhs.kr/api/v1/ws
- `NEXT_PUBLIC_APP_ENV`: production

## 📄 라이센스

MIT

## 👥 기여자

- [@kangeunchan](https://github.com/kangeunchan) - 대덕소프트웨어마이스터고등학교
