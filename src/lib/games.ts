import type { CartaData, GameMeta } from "./cartaData"
import { parseCartaData } from "./cartaData"

export type GameSummary = {
  gameId: string
  meta: GameMeta
}

type GameIndex = {
  gameIds: string[]
}

type GameData = {
  meta?: GameMeta
}

const normalizeBaseUrl = (value: string) => {
  if (!value || value === "/") {
    return "/"
  }

  return value.endsWith("/") ? value : `${value}/`
}

const buildAssetUrl = (path: string) => {
  const baseUrl = normalizeBaseUrl(import.meta.env.BASE_URL)
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  return `${baseUrl}${normalizedPath}`
}

const fetchJson = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${url}`)
  }
  const data = await response.json()
  return data
}

export const parseGameIndex = (data: unknown): string[] => {
  const index = data as GameIndex

  if (!index?.gameIds || !Array.isArray(index.gameIds)) {
    throw new Error("Invalid game index data")
  }

  return index.gameIds
}

export const extractGameMeta = (data: unknown): GameMeta | null => {
  const gameData = data as GameData
  const meta = gameData?.meta

  if (!meta || typeof meta.title !== "string" || typeof meta.description !== "string") {
    return null
  }

  return meta
}

export const fetchGameIndex = async (): Promise<string[]> => {
  const data = await fetchJson(buildAssetUrl("assets/data/index.json"))
  return parseGameIndex(data)
}

export const fetchGameMeta = async (gameId: string): Promise<GameMeta> => {
  const data = await fetchJson(buildAssetUrl(`assets/data/${gameId}.json`))
  const meta = extractGameMeta(data)

  if (!meta) {
    throw new Error("Invalid game meta data")
  }

  return meta
}

export const fetchGameData = async (gameId: string): Promise<CartaData> => {
  const data = await fetchJson(buildAssetUrl(`assets/data/${gameId}.json`))
  return parseCartaData(data)
}

export const fetchGameSummaries = async (): Promise<GameSummary[]> => {
  const gameIds = await fetchGameIndex()

  if (gameIds.length === 0) {
    return []
  }

  const results = await Promise.allSettled(
    gameIds.map(async (gameId) => ({ gameId, meta: await fetchGameMeta(gameId) })),
  )

  const summaries = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  )

  if (summaries.length === 0) {
    throw new Error("No valid games")
  }

  return summaries
}
