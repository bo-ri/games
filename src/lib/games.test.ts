import { beforeEach, describe, expect, it, vi } from "vitest"

import { extractGameMeta, fetchGameSummaries, parseGameIndex } from "./games"

type MockResponse = {
  ok: boolean
  json: () => Promise<unknown>
}

const createResponse = (data: unknown, ok = true): MockResponse => {
  return {
    ok,
    json: async () => data,
  }
}

describe("parseGameIndex", () => {
  it("returns game ids when valid", () => {
    expect(parseGameIndex({ gameIds: ["kojien", "edo"] })).toEqual([
      "kojien",
      "edo",
    ])
  })

  it("throws when gameIds is not an array", () => {
    expect(() => parseGameIndex({ gameIds: "kojien" })).toThrow(
      "Invalid game index data",
    )
  })
})

describe("extractGameMeta", () => {
  it("returns meta when title and description exist", () => {
    expect(
      extractGameMeta({ meta: { title: "広辞苑カルタ", description: "説明" } }),
    ).toEqual({ title: "広辞苑カルタ", description: "説明" })
  })

  it("returns null when meta is missing", () => {
    expect(extractGameMeta({ items: [] })).toBeNull()
  })
})

describe("fetchGameSummaries", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock as unknown as typeof fetch
  })

  it("returns summaries for valid game data", async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse({ gameIds: ["kojien"] }))
      .mockResolvedValueOnce(
        createResponse({ meta: { title: "広辞苑カルタ", description: "説明" } }),
      )

    await expect(fetchGameSummaries()).resolves.toEqual([
      {
        gameId: "kojien",
        meta: { title: "広辞苑カルタ", description: "説明" },
      },
    ])
  })

  it("skips invalid meta entries", async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse({ gameIds: ["kojien", "invalid"] }))
      .mockResolvedValueOnce(
        createResponse({ meta: { title: "広辞苑カルタ", description: "説明" } }),
      )
      .mockResolvedValueOnce(createResponse({ items: [] }))

    await expect(fetchGameSummaries()).resolves.toEqual([
      {
        gameId: "kojien",
        meta: { title: "広辞苑カルタ", description: "説明" },
      },
    ])
  })

  it("throws when all game data is invalid", async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse({ gameIds: ["invalid"] }))
      .mockResolvedValueOnce(createResponse({ items: [] }))

    await expect(fetchGameSummaries()).rejects.toThrow("No valid games")
  })
})
