# YUON Chat Widget

독립 실행형 채팅 위젯 - 어떤 웹사이트에도 쉽게 임베드할 수 있습니다.

## 🚀 빠른 시작

### 1. 개발 모드

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 2. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일: `dist/yuon-widget.js` (약 150KB gzipped)

## 📦 사용 방법

### HTML에 삽입

```html
<!-- 1. 스크립트 로드 -->
<script src="https://your-cdn.com/yuon-widget.js"></script>

<!-- 2. 초기화 -->
<script>
  YuonChat.init({
    apiUrl: 'https://api.yourdomain.com/api/v1',
    wsUrl: 'wss://api.yourdomain.com/api/v1/ws',
    theme: 'dark',
    position: 'right',
    primaryColor: '#3b82f6',
    welcomeMessage: '안녕하세요! 무엇을 도와드릴까요?'
  })
</script>
```

### 동적으로 제어

```javascript
// 위젯 초기화
YuonChat.init({ ... })

// 설정 업데이트
YuonChat.updateConfig({
  theme: 'light',
  primaryColor: '#10b981'
})

// 위젯 제거
YuonChat.destroy()
```

## ⚙️ 설정 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `apiUrl` | string | `http://localhost:8080/api/v1` | API 서버 URL |
| `wsUrl` | string | `ws://localhost:8080/api/v1/ws` | WebSocket URL |
| `theme` | `'light' \| 'dark'` | `'dark'` | 테마 |
| `position` | `'left' \| 'right'` | `'right'` | 화면 위치 |
| `primaryColor` | string | `#3b82f6` | 메인 컬러 |
| `welcomeMessage` | string | - | 환영 메시지 |

## 📁 프로젝트 구조

```
widget/
├── src/
│   ├── index.tsx         # 엔트리포인트
│   ├── ChatWidget.tsx    # 메인 위젯 컴포넌트
│   └── styles.css        # 스타일
├── public/
│   └── demo.html         # 데모 페이지
├── dist/                 # 빌드 결과물
├── vite.config.ts        # Vite 설정
└── package.json
```

## 🔧 기술 스택

- React 19
- TypeScript
- Vite (빌드 도구)
- WebSocket (실시간 통신)

## 📝 배포

빌드된 `dist/yuon-widget.js` 파일을 CDN에 업로드:

- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages

## 🤝 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📄 라이선스

MIT
