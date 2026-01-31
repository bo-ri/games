import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { TopPage } from "./TopPage"
import type { GameSummary } from "../lib/games"

const fetchGameSummaries = vi.fn()

vi.mock("../lib/games", () => ({
  fetchGameSummaries: () => fetchGameSummaries(),
}))

const renderTopPage = () => {
  return render(
    <MemoryRouter>
      <TopPage />
    </MemoryRouter>,
  )
}

describe("TopPage", () => {
  it("shows loading state initially", () => {
    fetchGameSummaries.mockResolvedValueOnce([])
    renderTopPage()

    expect(screen.getByText("読み込み中")).toBeTruthy()
  })

  it("shows empty state when no games", async () => {
    fetchGameSummaries.mockResolvedValueOnce([])
    renderTopPage()

    expect(await screen.findByText("利用可能なゲームがありません")).toBeTruthy()
  })

  it("shows game cards when data is available", async () => {
    const games: GameSummary[] = [
      {
        gameId: "kojien",
        meta: { title: "広辞苑カルタ", description: "説明" },
      },
    ]

    fetchGameSummaries.mockResolvedValueOnce(games)
    renderTopPage()

    expect(await screen.findByText("広辞苑カルタ")).toBeTruthy()
    expect(screen.getByText("説明")).toBeTruthy()
    expect(screen.getByRole("link", { name: "広辞苑カルタを開始" })).toBeTruthy()
  })

  it("shows error state when fetch fails", async () => {
    fetchGameSummaries.mockRejectedValueOnce(new Error("fetch failed"))
    renderTopPage()

    expect(await screen.findByText("ゲーム一覧の取得に失敗しました")).toBeTruthy()
    expect(screen.getByRole("button", { name: "再読み込み" })).toBeTruthy()
  })
})
