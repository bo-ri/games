import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"

import { GameStartPage } from "./GameStartPage"

const fetchGameData = vi.fn()
const speak = vi.fn()
const cancel = vi.fn()
const speechController = { speak, cancel }
const gameIdParam = { value: "kojien" as string | undefined }

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>()
  return {
    ...actual,
    useParams: () => ({ gameId: gameIdParam.value }),
  }
})

vi.mock("../lib/games", () => ({
  fetchGameData: (...args: unknown[]) => fetchGameData(...args),
}))

vi.mock("../lib/speechController", () => ({
  useSpeechController: () => speechController,
}))

const renderWithRoute = (entry: string, route = "/game/:gameId") => {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={route} element={<GameStartPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const createItem = (description: string, answer: string, howToReadAnswer = answer) => {
  return {
    description,
    answer,
    howToReadDescription: description,
    howToReadAnswer,
  }
}

const createGameData = (items = [createItem("句", "答え"), createItem("次の句", "次の答え")]) => {
  return {
    meta: { title: "広辞苑カルタ", description: "説明" },
    items,
  }
}

describe("GameStartPage", () => {
  beforeEach(() => {
    fetchGameData.mockReset()
    speak.mockReset()
    cancel.mockReset()
    gameIdParam.value = "kojien"
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it("shows loading state initially", () => {
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    expect(screen.getByText("読み込み中")).toBeTruthy()
  })

  it("shows game meta when loaded", async () => {
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    expect(await screen.findByText("説明")).toBeTruthy()
    expect(await screen.findByText("広辞苑カルタ")).toBeTruthy()
    expect(await screen.findByText(/選択中:\s*広辞苑カルタ/)).toBeTruthy()
  })

  it("keeps the card area centered with fixed width", async () => {
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    const cardSection = screen
      .getByText("読み札を開始してください")
      .closest("section")

    expect(cardSection).toBeTruthy()
    const style = cardSection?.getAttribute("style") ?? ""
    expect(style).toContain("width: 70vw")
    expect(style).toContain("height: 50vh")
    expect(style).toContain("display: flex")
    expect(style).toContain("justify-content: center")
    expect(style).toContain("align-items: center")
    expect(screen.getByRole("link", { name: "トップに戻る" })).toBeTruthy()
  })

  it("breaks description every 15 characters", async () => {
    let endSpeak: (() => void) | null = null
    speak.mockImplementation(
      ({ onBoundary, onEnd }: { onBoundary: (boundary: { charIndex: number }) => void; onEnd: () => void }) => {
        onBoundary({ charIndex: 15 })
        return new Promise((resolve) => {
          endSpeak = () => {
            onEnd()
            resolve({ ok: true, value: { text: "読み上げ" } })
          }
        })
      },
    )
    const longDescription = "あいうえおかきくけこさしすせそた"
    fetchGameData.mockResolvedValueOnce(createGameData([createItem(longDescription, "答え")]))
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    await act(async () => {
      endSpeak?.()
    })

    const expected = `${longDescription.slice(0, 15)}\n${longDescription.slice(15)}`
    const matches = screen.getAllByText((_, node) => node?.textContent === expected)
    expect(matches.length).toBeGreaterThan(0)
  })

  it("speaks the sample text when rate changes", async () => {
    speak.mockResolvedValue({ ok: true, value: { text: "サンプル" } })
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    const slider = screen.getByLabelText("読み上げ速度")
    fireEvent.change(slider, { target: { value: "1.5" } })

    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "ふるいけやかわずとびこむなつのおと",
        rate: 1.5,
      }),
    )
  })

  it("shows error when gameId is missing", async () => {
    gameIdParam.value = undefined
    renderWithRoute("/game", "/game")

    expect(await screen.findByText("選択に失敗しました")).toBeTruthy()
  })

  it("shows default error message when fetch fails", async () => {
    fetchGameData.mockRejectedValueOnce(new Error("not found"))
    renderWithRoute("/game/missing")

    expect(await screen.findByText("データの取得に失敗しました")).toBeTruthy()
  })

  it("loads items when start is pressed", async () => {
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "説明" } }
    })
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    const startButton = await screen.findByRole("button", { name: "開始" })
    fireEvent.click(startButton)

    expect(fetchGameData).toHaveBeenCalledTimes(1)
    expect(fetchGameData).toHaveBeenCalledWith("kojien")
  })

  it("shows current card number and remaining count while reading", async () => {
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "読み上げ" } }
    })
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    expect(screen.getByText(/現在の札: 1/)).toBeTruthy()
    expect(screen.getByText(/残り: 1/)).toBeTruthy()
  })

  it("pauses and resumes the reading session", async () => {
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "読み上げ" } }
    })
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    const pauseButton = screen.getByRole("button", { name: "一時停止" })
    fireEvent.click(pauseButton)

    expect(screen.getByRole("button", { name: "再開" })).toBeTruthy()

    const resumeButton = screen.getByRole("button", { name: "再開" })
    await act(async () => {
      fireEvent.click(resumeButton)
    })

    expect(screen.getByRole("button", { name: "一時停止" })).toBeTruthy()
  })

  it("shows reset after finishing and returns to idle", async () => {
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "読み上げ" } }
    })
    fetchGameData.mockResolvedValueOnce(createGameData([createItem("句", "答え")]))
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16000)
    })

    const resetButton = screen.getByRole("button", { name: "リセット" })
    expect(resetButton).toBeTruthy()
    fireEvent.click(resetButton)

    expect(screen.getByRole("button", { name: "開始" })).toBeTruthy()
    expect(screen.getByText(/開始待機中/)).toBeTruthy()
  })

  it("shows loading only before first reading", async () => {
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "読み上げ" } }
    })
    fetchGameData.mockResolvedValueOnce(createGameData([createItem("句", "答え")]))
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })
    expect(screen.getByText("読み上げ準備中")).toBeTruthy()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(screen.queryByText("読み上げ準備中")).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(screen.queryByText("読み上げ準備中")).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(screen.queryByText("読み上げ準備中")).toBeNull()
  })

  it("updates description display as speech progresses", async () => {
    let endSpeak: (() => void) | null = null
    let callCount = 0
    speak.mockImplementation(
      ({ onBoundary, onEnd }: { onBoundary: (boundary: { charIndex: number }) => void; onEnd: () => void }) => {
      callCount += 1
      if (callCount === 1) {
        onBoundary({ charIndex: 0 })
        return new Promise((resolve) => {
          endSpeak = () => {
            onEnd()
            resolve({ ok: true, value: { text: "読み上げ" } })
          }
        })
      }

      onEnd()
      return Promise.resolve({ ok: true, value: { text: "読み上げ" } })
      },
    )
    fetchGameData.mockResolvedValueOnce(createGameData([createItem("あい", "答え")]))
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(screen.getByText("あ")).toBeTruthy()

    await act(async () => {
      endSpeak?.()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(13000)
    })
  })

  it("shows answer modal and next button during reading", async () => {
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "読み上げ" } }
    })
    fetchGameData.mockResolvedValueOnce(
      createGameData([
        createItem("句", "答え", "ふりがな"),
        createItem("次の句", "次の答え", "つぎのこたえ"),
      ]),
    )
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(screen.getByRole("button", { name: "次へ" })).toBeTruthy()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(screen.getAllByText(/答え/).length).toBeGreaterThan(0)
    expect(screen.getByText(/ふりがな|つぎのこたえ/)).toBeTruthy()
  })

  it("keeps the latest history item first", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9)
    speak.mockImplementation(async ({ onEnd }: { onEnd: () => void }) => {
      onEnd()
      return { ok: true, value: { text: "読み上げ" } }
    })
    fetchGameData.mockResolvedValueOnce(createGameData())
    renderWithRoute("/game/kojien")

    await screen.findByText("説明")
    vi.useFakeTimers()

    const startButton = screen.getByRole("button", { name: "開始" })
    await act(async () => {
      fireEvent.click(startButton)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16000)
    })

    const nextButton = screen.getByRole("button", { name: "次へ" })
    await act(async () => {
      fireEvent.click(nextButton)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16000)
    })

    const items = screen.getAllByRole("listitem")
    expect(items[0]?.textContent).toContain("次の句")
    expect(items[1]?.textContent).toContain("句")
    randomSpy.mockRestore()
  })

  it("shows invalid data message when data format is wrong", async () => {
    fetchGameData.mockRejectedValueOnce(new Error("Invalid carta data"))
    renderWithRoute("/game/kojien")

    expect(await screen.findByText("データ形式が不正です")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "開始" })).toBeNull()
  })
})
