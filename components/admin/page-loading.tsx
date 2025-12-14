export function PageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#27272a] border-t-blue-500" />
        <p className="text-sm text-[#71717a]">로딩 중...</p>
      </div>
    </div>
  )
}
