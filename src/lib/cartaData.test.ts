import { describe, expect, it } from "vitest"

import { parseCartaData } from "./cartaData"

describe("parseCartaData", () => {
  it("returns meta and items when valid", () => {
    const result = parseCartaData({
      meta: { title: "広辞苑かるた", description: "説明" },
      items: [
        {
          description: "句",
          answer: "答え",
          howtoread_description: "く",
          howtoread_answer: "こたえ",
        },
      ],
    })

    expect(result).toEqual({
      meta: { title: "広辞苑かるた", description: "説明" },
      items: [
        {
          description: "句",
          answer: "答え",
          howToReadDescription: "く",
          howToReadAnswer: "こたえ",
        },
      ],
    })
  })

  it("throws when meta is invalid", () => {
    expect(() =>
      parseCartaData({ meta: { title: 1, description: "説明" }, items: [] }),
    ).toThrow("Invalid carta data")
  })

  it("throws when items are invalid", () => {
    expect(() =>
      parseCartaData({ meta: { title: "広辞苑", description: "説明" }, items: [{}] }),
    ).toThrow("Invalid carta data")
  })

  it("accepts legacy howtoreadanswer field", () => {
    const result = parseCartaData({
      meta: { title: "広辞苑かるた", description: "説明" },
      items: [
        {
          description: "句",
          answer: "答え",
          howtoread_description: "く",
          howtoreadanswer: "こたえ",
        },
      ],
    })

    expect(result).toEqual({
      meta: { title: "広辞苑かるた", description: "説明" },
      items: [
        {
          description: "句",
          answer: "答え",
          howToReadDescription: "く",
          howToReadAnswer: "こたえ",
        },
      ],
    })
  })
})
