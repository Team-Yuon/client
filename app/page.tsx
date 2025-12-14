import { ChatWidget } from "@/components/chatbot/chat-widget"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* 데모 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">채널톡 스타일 챗봇</h1>
          <p className="text-lg text-muted-foreground">오른쪽 하단의 채팅 버튼을 클릭해보세요</p>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-card-foreground">주요 기능</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                플로팅 채팅 버튼
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                부드러운 열기/닫기 애니메이션
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                메시지 버블 UI
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                타이핑 인디케이터
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                최소화 기능
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-card-foreground">사용 방법</h2>
            <p className="leading-relaxed text-muted-foreground">
              채팅 위젯은 어떤 페이지에서든 사용할 수 있습니다.
              <code className="mx-1 rounded bg-muted px-2 py-1 text-sm">{"<ChatWidget />"}</code>
              컴포넌트를 원하는 위치에 추가하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 챗봇 위젯 */}
      <ChatWidget />
    </main>
  )
}
