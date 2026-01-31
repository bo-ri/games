import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"

import { GameStartPage } from "./GameStartPage"

const fetchGameMeta = vi.fn()

vi.mock("../lib/games", () => ({
  fetchGameMeta: (...args: unknown[]) => fetchGameMeta(...args),
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

describe("GameStartPage", () => {
  beforeEach(() => {
    fetchGameMeta.mockReset()
  })

  it("shows loading state initially", () => {
    fetchGameMeta.mockResolvedValueOnce({ title: "広辞苑カルタ", description: "説明" })
    renderWithRoute("/game/kojien")

    expect(screen.getByText("読み込み中")).toBeTruthy()
  })

  it("shows game meta when loaded", async () => {
    fetchGameMeta.mockResolvedValueOnce({ title: "広辞苑カルタ", description: "説明" })
    renderWithRoute("/game/kojien")

    expect(await screen.findByText("広辞苑カルタ")).toBeTruthy()
    expect(screen.getByText("説明")).toBeTruthy()
    expect(screen.getByText("準備中です。")).toBeTruthy()
  })

  it("shows error when gameId is missing", async () => {
    renderWithRoute("/game", "/game")

    expect(await screen.findByText("選択に失敗しました")).toBeTruthy()
  })

  it("shows default error message when fetch fails", async () => {
    fetchGameMeta.mockRejectedValueOnce(new Error("not found"))
    renderWithRoute("/game/missing")

    expect(await screen.findByText("選択に失敗しました")).toBeTruthy()
  })
})
