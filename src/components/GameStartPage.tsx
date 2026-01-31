import { useEffect, useState } from "react"
import { useParams } from "react-router"

import { fetchGameMeta } from "../lib/games"

type PageStatus = "loading" | "ready" | "error"

const defaultErrorMessage = "選択に失敗しました"

export const GameStartPage = () => {
  const { gameId } = useParams()
  const [status, setStatus] = useState<PageStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) {
        setStatus("error")
        setError(defaultErrorMessage)
        return
      }

      try {
        const meta = await fetchGameMeta(gameId)
        setTitle(meta.title)
        setDescription(meta.description)
        setStatus("ready")
      } catch (loadError) {
        setStatus("error")
        setError(defaultErrorMessage)
      }
    }

    void loadGame()
  }, [gameId])

  if (status === "error") {
    return (
      <main>
        <h1>ゲーム開始</h1>
        <p role="alert">{error ?? defaultErrorMessage}</p>
      </main>
    )
  }

  if (status === "loading") {
    return (
      <main>
        <h1>ゲーム開始</h1>
        <p role="status">読み込み中</p>
      </main>
    )
  }

  return (
    <main>
      <h1>{title ?? "ゲーム開始"}</h1>
      {description && <p>{description}</p>}
      <p>準備中です。</p>
    </main>
  )
}
