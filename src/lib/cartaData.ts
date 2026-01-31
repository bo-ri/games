export type GameMeta = {
  title: string
  description: string
}

export type CartaItem = {
  description: string
  answer: string
  howToReadDescription: string
  howToReadAnswer: string
}

export type CartaData = {
  meta: GameMeta
  items: CartaItem[]
}

const isGameMeta = (value: unknown): value is GameMeta => {
  if (!value || typeof value !== "object") {
    return false
  }

  const meta = value as GameMeta
  return typeof meta.title === "string" && typeof meta.description === "string"
}

const isCartaItem = (value: unknown): value is CartaItem => {
  if (!value || typeof value !== "object") {
    return false
  }

  const item = value as {
    description?: unknown
    answer?: unknown
    howtoread_description?: unknown
    howtoread_answer?: unknown
    howtoreadanswer?: unknown
  }

  const howToReadAnswer =
    typeof item.howtoread_answer === "string"
      ? item.howtoread_answer
      : item.howtoreadanswer

  return (
    typeof item.description === "string" &&
    typeof item.answer === "string" &&
    typeof item.howtoread_description === "string" &&
    typeof howToReadAnswer === "string"
  )
}

export const parseCartaData = (value: unknown): CartaData => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid carta data")
  }

  const data = value as { meta?: unknown; items?: unknown }

  if (!isGameMeta(data.meta)) {
    throw new Error("Invalid carta data")
  }

  if (!Array.isArray(data.items) || !data.items.every(isCartaItem)) {
    throw new Error("Invalid carta data")
  }

  const items = (data.items as {
    description: string
    answer: string
    howtoread_description: string
    howtoread_answer?: string
    howtoreadanswer?: string
  }[]).map((item) => ({
    description: item.description,
    answer: item.answer,
    howToReadDescription: item.howtoread_description,
    howToReadAnswer: item.howtoread_answer ?? item.howtoreadanswer ?? "",
  }))

  return { meta: data.meta, items }
}
