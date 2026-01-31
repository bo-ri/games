import { describe, expect, it, vi } from "vitest"

import { createSpeechController } from "./speechController"

type FakeBoundaryEvent = { charIndex: number }

type FakeUtterance = {
  text: string
  rate: number
  onboundary?: (event: FakeBoundaryEvent) => void
  onend?: () => void
  onerror?: () => void
}

describe("createSpeechController", () => {
  it("returns unsupported error when synthesis is missing", async () => {
    const controller = createSpeechController(null, (text) => ({ text, rate: 1 }))

    const result = await controller.speak({
      text: "テスト",
      rate: 1,
      onBoundary: () => {},
      onEnd: () => {},
      onError: () => {},
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.type).toBe("unsupported")
    }
  })

  it("speaks and notifies boundary/end events", async () => {
    const speak = vi.fn((utterance: FakeUtterance) => {
      utterance.onboundary?.({ charIndex: 2 })
      utterance.onend?.()
    })
    const cancel = vi.fn()
    const utteranceFactory = (text: string): FakeUtterance => ({ text, rate: 1 })
    const controller = createSpeechController({ speak, cancel }, utteranceFactory)
    const onBoundary = vi.fn()
    const onEnd = vi.fn()

    const result = await controller.speak({
      text: "テスト",
      rate: 1,
      onBoundary,
      onEnd,
      onError: () => {},
    })

    expect(result.ok).toBe(true)
    expect(speak).toHaveBeenCalledOnce()
    expect(onBoundary).toHaveBeenCalledWith({ charIndex: 2 })
    expect(onEnd).toHaveBeenCalledOnce()
    controller.cancel()
    expect(cancel).toHaveBeenCalledOnce()
  })

  it("resolves even when end event is missing", async () => {
    vi.useFakeTimers()
    const speak = vi.fn()
    const cancel = vi.fn()
    const utteranceFactory = (text: string): FakeUtterance => ({ text, rate: 1 })
    const controller = createSpeechController({ speak, cancel }, utteranceFactory)
    const onEnd = vi.fn()

    const promise = controller.speak({
      text: "長めのテキスト",
      rate: 1,
      onBoundary: () => {},
      onEnd,
      onError: () => {},
    })

    await vi.advanceTimersByTimeAsync(5000)
    await expect(promise).resolves.toEqual({ ok: true, value: { text: "長めのテキスト" } })
    expect(onEnd).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
