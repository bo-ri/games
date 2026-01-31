type ErrorStateProps = {
  message: string
  onRetry: () => void
}

export const LoadingState = () => {
  return (
    <div role="status" aria-live="polite">
      読み込み中
    </div>
  )
}

export const EmptyState = () => {
  return <p>利用可能なゲームがありません</p>
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        再読み込み
      </button>
    </div>
  )
}
