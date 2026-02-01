import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"

import type { CartaData, CartaItem, GameMeta } from "../lib/cartaData"
import { fetchGameData } from "../lib/games"
import { createReadingOrder } from "../lib/readingOrder"
import { useSpeechController } from "../lib/speechController"

type PageStatus = "loading" | "ready" | "error"

type SessionPhase =
  | "idle"
  | "loadingFirst"
  | "readingDescriptionFirst"
  | "readingDescriptionSecond"
  | "waitingAnswer"
  | "readingAnswer"
  | "readyNext"
  | "finished"
  | "paused"

const defaultErrorMessage = "選択に失敗しました"
const dataFetchErrorMessage = "データの取得に失敗しました"
const invalidDataMessage = "データ形式が不正です"
const loadingDelayMs = 3000
const sampleText = "ふるいけやかわずとびこむなつのおと"

export const GameStartPage = () => {
  const { gameId } = useParams()
  const speechController = useSpeechController()
  const [status, setStatus] = useState<PageStatus>("loading")
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [gameData, setGameData] = useState<CartaData | null>(null)
  const [gameMeta, setGameMeta] = useState<GameMeta | null>(null)
  const [readingOrder, setReadingOrder] = useState<number[]>([])
  const [currentPosition, setCurrentPosition] = useState<number | null>(null)
  const [historyItems, setHistoryItems] = useState<CartaItem[]>([])
  const [descriptionDisplay, setDescriptionDisplay] = useState("")
  const [answerDisplay, setAnswerDisplay] = useState("")
  const [furiganaDisplay, setFuriganaDisplay] = useState("")
  const [nextAvailable, setNextAvailable] = useState(false)
  const [rate, setRate] = useState(1)
  const [showDescription, setShowDescription] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const timersRef = useRef<number[]>([])
  const rateRef = useRef(rate)

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  const currentItem = useMemo(() => {
    if (!gameData || currentPosition === null) {
      return null
    }

    const index = readingOrder[currentPosition]
    return gameData.items[index] ?? null
  }, [currentPosition, gameData, readingOrder])

  const isActiveReading =
    sessionPhase !== "idle" &&
    sessionPhase !== "readyNext" &&
    sessionPhase !== "finished" &&
    sessionPhase !== "paused"

  const remainingCount = useMemo(() => {
    if (!gameData) {
      return 0
    }

    const currentOffset = currentItem && isActiveReading ? 1 : 0
    return Math.max(0, gameData.items.length - historyItems.length - currentOffset)
  }, [gameData, historyItems.length, currentItem, isActiveReading])

  const currentNumber = currentItem ? historyItems.length + 1 : 0

  const clearTimers = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    timersRef.current = []
  }

  const resolveDataErrorMessage = (loadError: unknown) => {
    if (loadError instanceof Error && loadError.message === "Invalid carta data") {
      return invalidDataMessage
    }

    return dataFetchErrorMessage
  }

  const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
      const timerId = window.setTimeout(resolve, ms)
      timersRef.current.push(timerId)
    })
  }

  const insertLineBreaks = (text: string, interval: number) => {
    if (text.length <= interval) {
      return text
    }

    const parts: string[] = []
    for (let i = 0; i < text.length; i += interval) {
      parts.push(text.slice(i, i + interval))
    }

    return parts.join("\n")
  }

  useEffect(() => {
    let active = true

    const loadGame = async () => {
      if (!gameId) {
        setStatus("error")
        setError(defaultErrorMessage)
        return
      }

      setStatus("loading")
      setError(null)

      setShowDescription(false)
      setShowTitle(false)

      try {
        const data = await fetchGameData(gameId)
        if (!active) {
          return
        }
        setGameData(data)
        setGameMeta(data.meta)
        setStatus("ready")
        setShowDescription(true)
        const titleTimer = window.setTimeout(() => setShowTitle(true), 0)
        timersRef.current.push(titleTimer)
        setHistoryItems([])
        setCurrentPosition(null)
        setSessionPhase("idle")
        setReadingOrder([])
        setDescriptionDisplay("")
        setAnswerDisplay("")
        setFuriganaDisplay("")
        setNextAvailable(false)
      } catch (loadError) {
        if (!active) {
          return
        }
        setStatus("error")
        setError(resolveDataErrorMessage(loadError))
      }
    }

    void loadGame()

    return () => {
      active = false
      speechController.cancel()
      clearTimers()
    }
  }, [gameId, speechController])

  const ensureGameData = async (): Promise<CartaData | null> => {
    if (!gameId) {
      return null
    }

    if (gameData) {
      return gameData
    }

    try {
      const data = await fetchGameData(gameId)
      setGameData(data)
      setGameMeta(data.meta)
      return data
    } catch (loadError) {
      setStatus("error")
      setError(resolveDataErrorMessage(loadError))
      return null
    }
  }

  const speakWithDisplay = async (
    speechText: string,
    displayText: string,
    setDisplay: (value: string) => void,
    phase: SessionPhase,
  ) => {
    setSessionPhase(phase)
    setDisplay("")
    const result = await speechController.speak({
      text: speechText,
      rate: rateRef.current,
      onBoundary: (boundary) => {
        const length = Math.min(boundary.charIndex + 1, displayText.length)
        setDisplay(displayText.slice(0, length))
      },
      onEnd: () => setDisplay(displayText),
      onError: () => {},
    })

    if (!result.ok) {
      setStatus("error")
      setError("読み上げに失敗しました")
    }

    return result.ok
  }

  const speakWithFurigana = async (
    speechText: string,
    answerText: string,
    furiganaText: string,
  ) => {
    setSessionPhase("readingAnswer")
    setAnswerDisplay("")
    setFuriganaDisplay("")
    const result = await speechController.speak({
      text: speechText,
      rate: rateRef.current,
      onBoundary: (boundary) => {
        const index = boundary.charIndex + 1
        setAnswerDisplay(answerText.slice(0, Math.min(index, answerText.length)))
        setFuriganaDisplay(furiganaText.slice(0, Math.min(index, furiganaText.length)))
      },
      onEnd: () => {
        setAnswerDisplay(answerText)
        setFuriganaDisplay(furiganaText)
      },
      onError: () => {},
    })

    if (!result.ok) {
      setStatus("error")
      setError("読み上げに失敗しました")
    }

    return result.ok
  }

  const runReadingSequence = async (item: CartaItem, position: number, order: number[]) => {
    clearTimers()
    setDescriptionDisplay("")
    setAnswerDisplay("")
    setFuriganaDisplay("")
    setNextAvailable(false)
    setSessionPhase("loadingFirst")
    await delay(loadingDelayMs)
    const firstOk = await speakWithDisplay(
      item.howToReadDescription,
      item.description,
      setDescriptionDisplay,
      "readingDescriptionFirst",
    )
    if (!firstOk) {
      return
    }

    await delay(loadingDelayMs)
    const secondOk = await speakWithDisplay(
      item.howToReadDescription,
      item.description,
      setDescriptionDisplay,
      "readingDescriptionSecond",
    )
    if (!secondOk) {
      return
    }

    const hasRemaining = position + 1 < order.length
    setNextAvailable(hasRemaining)
    setSessionPhase("waitingAnswer")
    await delay(10000)
    const answerOk = await speakWithFurigana(item.howToReadAnswer, item.answer, item.howToReadAnswer)
    if (!answerOk) {
      return
    }

    setHistoryItems((prev) => [item, ...prev])
    setSessionPhase(hasRemaining ? "readyNext" : "finished")
    if (!hasRemaining) {
      setNextAvailable(false)
    }
  }

  const handleStart = async () => {
    const data = await ensureGameData()
    if (!data) {
      return
    }

    if (data.items.length === 0) {
      setSessionPhase("finished")
      return
    }

    const order = createReadingOrder(data.items.length)
    setReadingOrder(order)
    setHistoryItems([])
    setCurrentPosition(0)
    setNextAvailable(false)
    const firstItem = data.items[order[0]]
    await runReadingSequence(firstItem, 0, order)
  }

  const handleNext = async () => {
    if (!nextAvailable) {
      return
    }

    speechController.cancel()
    clearTimers()
    if (currentItem) {
      const alreadyStored = historyItems.some(
        (item) => item.description === currentItem.description && item.answer === currentItem.answer,
      )
      if (!alreadyStored) {
        setHistoryItems((prev) => [currentItem, ...prev])
      }
    }
    const data = await ensureGameData()
    if (!data || currentPosition === null) {
      return
    }

    const nextPosition = currentPosition + 1
    const nextIndex = readingOrder[nextPosition]
    const nextItem = data.items[nextIndex]
    if (!nextItem) {
      setSessionPhase("finished")
      setNextAvailable(false)
      return
    }

    setCurrentPosition(nextPosition)
    setNextAvailable(false)
    await runReadingSequence(nextItem, nextPosition, readingOrder)
  }

  const handlePause = () => {
    speechController.cancel()
    clearTimers()
    setSessionPhase("paused")
  }

  const handleResume = async () => {
    if (!currentItem || currentPosition === null) {
      return
    }

    await runReadingSequence(currentItem, currentPosition, readingOrder)
  }

  const handleReset = () => {
    speechController.cancel()
    clearTimers()
    setHistoryItems([])
    setCurrentPosition(null)
    setSessionPhase("idle")
    setNextAvailable(false)
    if (gameData) {
      setReadingOrder(createReadingOrder(gameData.items.length))
    }
    setDescriptionDisplay("")
    setAnswerDisplay("")
    setFuriganaDisplay("")
  }

  const handleRateChange = (nextRate: number) => {
    setRate(nextRate)
  }

  const handleSamplePlay = () => {
    void speechController.speak({
      text: sampleText,
      rate: rateRef.current,
      onBoundary: () => {},
      onEnd: () => {},
      onError: () => {},
    })
  }

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

  if (!gameMeta) {
    return null
  }

  const isLoading = sessionPhase === "loadingFirst"
  const showAnswerModal =
    sessionPhase === "waitingAnswer" ||
    sessionPhase === "readingAnswer" ||
    sessionPhase === "readyNext" ||
    sessionPhase === "finished"

  const formattedDescription = insertLineBreaks(
    descriptionDisplay || "読み札を開始してください",
    15,
  )

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        background: "linear-gradient(160deg, #f4efe4 0%, #e7dac2 60%, #d9c6a2 100%)",
        color: "#2b1f12",
      }}
    >
      <header style={{ width: "100%", maxWidth: "1100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: "14px", letterSpacing: "0.08em" }}>
              選択中: {gameMeta.title}
            </p>
            {showTitle && <h1 style={{ margin: "8px 0 0" }}>{gameMeta.title}</h1>}
            {showDescription && <p style={{ marginTop: "8px" }}>{gameMeta.description}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            <label htmlFor="speech-rate">読み上げ速度</label>
            <input
              id="speech-rate"
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={rate}
              onChange={(event) => handleRateChange(Number(event.target.value))}
            />
            <button type="button" onClick={handleSamplePlay}>
              サンプル再生
            </button>
          </div>
        </div>
      </header>

      <section
        style={{
          width: "70vw",
          maxWidth: "920px",
          height: "50vh",
          background: "#fdf8ed",
          border: "3px solid #c8b08a",
          borderRadius: "18px",
          boxShadow: "0 24px 60px rgba(60, 40, 20, 0.18)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          padding: "32px",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            読み上げ準備中
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "40px",
            writingMode: "vertical-rl",
            textOrientation: "upright",
            fontSize: "22px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            wordBreak: "break-all",
          }}
        >
          <div>{formattedDescription}</div>
        </div>
      </section>

      {showAnswerModal && (
        <section
          role="dialog"
          aria-modal="true"
          style={{
            width: "100%",
            maxWidth: "720px",
            background: "rgba(253, 248, 237, 0.98)",
            border: "2px solid #b89b6e",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 16px 40px rgba(60, 40, 20, 0.2)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0 }}>解答</h2>
          <p style={{ margin: 0, fontSize: "16px", letterSpacing: "0.12em" }}>
            {furiganaDisplay || "ふりがなを読み上げ中"}
          </p>
          <p style={{ fontSize: "20px", margin: "12px 0" }}>
            {answerDisplay || "解答を読み上げ中"}
          </p>
          {nextAvailable && (
            <button type="button" onClick={() => void handleNext()}>
              次へ
            </button>
          )}
        </section>
      )}

      <section style={{ width: "100%", maxWidth: "920px", textAlign: "center" }}>
        <p>
          {currentNumber > 0 ? `現在の札: ${currentNumber}` : "開始待機中"}
          {" · "}残り: {remainingCount}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {sessionPhase === "idle" && (
            <button type="button" onClick={() => void handleStart()}>
              開始
            </button>
          )}
          {sessionPhase === "finished" && (
            <button type="button" onClick={handleReset}>
              リセット
            </button>
          )}
          {sessionPhase !== "idle" && sessionPhase !== "finished" && sessionPhase !== "paused" && (
            <button type="button" onClick={handlePause}>
              一時停止
            </button>
          )}
          {sessionPhase === "paused" && (
            <button type="button" onClick={() => void handleResume()}>
              再開
            </button>
          )}
          <Link to="/">トップに戻る</Link>
        </div>
      </section>

      <section style={{ width: "100%", maxWidth: "920px" }}>
        <h2>読み上げ済み</h2>
        <ol style={{ display: "grid", gap: "12px", paddingLeft: "20px" }}>
          {historyItems.map((item, index) => (
            <li key={`${item.description}-${index}`}>
              <div>{item.description}</div>
              <div>{item.answer}</div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
