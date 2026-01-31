import { describe, expect, it } from "vitest"

import { createReadingOrder } from "./readingOrder"

describe("createReadingOrder", () => {
  it("returns unique indices", () => {
    const order = createReadingOrder(5, () => 0.3)
    expect(order).toHaveLength(5)
    expect(new Set(order).size).toBe(5)
  })

  it("returns deterministic order with stub random", () => {
    const sequence = [0.9, 0.1, 0.5, 0.2]
    let index = 0
    const random = () => sequence[index++] ?? 0
    const order = createReadingOrder(4, random)

    expect(order).toEqual([2, 1, 0, 3])
  })
})
