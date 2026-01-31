import { useCallback, useEffect, useState } from "react"

import { fetchGameSummaries } from "../lib/games"
import type { GameSummary } from "../lib/games"
import { GameList } from "./GameList"
import { EmptyState, ErrorState, LoadingState } from "./states"

type PageStatus = "loading" | "ready" | "empty" | "error"

const defaultErrorMessage = "ゲーム一覧の取得に失敗しました"

export const TopPage = () => {
  const [status, setStatus] = useState<PageStatus>("loading")
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadGames = useCallback(async () => {
    setStatus("loading")
    setError(null)

    try {
      const summaries = await fetchGameSummaries()
      setGames(summaries)
      setStatus(summaries.length === 0 ? "empty" : "ready")
    } catch (loadError) {
      setGames([])
      setStatus("error")
      setError(defaultErrorMessage)
    }
  }, [])

  useEffect(() => {
    void loadGames()
  }, [loadGames])

  return (
    <main>
      <header>
        <h1>広辞苑カルタリーダー</h1>
        <p>遊びたいカルタを選んで開始してください。</p>
      </header>
      {status === "loading" && <LoadingState />}
      {status === "error" && (
        <ErrorState message={error ?? defaultErrorMessage} onRetry={loadGames} />
      )}
      {status === "empty" && <EmptyState />}
      {status === "ready" && <GameList games={games} />}
    </main>
  )
}
