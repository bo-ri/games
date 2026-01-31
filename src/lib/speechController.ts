import { useMemo } from "react"

export type SpeechBoundary = { charIndex: number }

export type SpeechError =
  | { type: "unsupported"; message: string }
  | { type: "synthesisError"; message: string }
  | { type: "canceled"; message: string }

export type SpeechRequest = {
  text: string
  rate: number
  onBoundary: (boundary: SpeechBoundary) => void
  onEnd: () => void
  onError: (error: SpeechError) => void
}

export type SpeechPlayback = {
  text: string
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

type SpeechUtterance = {
  text: string
  rate: number
  onboundary?: (event: SpeechBoundary) => void
  onend?: () => void
  onerror?: () => void
}

type SpeechSynthesisLike = {
  speak: (utterance: SpeechUtterance) => void
  cancel: () => void
}

type UtteranceFactory = (text: string) => SpeechUtterance

export type SpeechController = {
  speak: (request: SpeechRequest) => Promise<Result<SpeechPlayback, SpeechError>>
  cancel: () => void
}

export const createSpeechController = (
  synthesis: SpeechSynthesisLike | null,
  createUtterance: UtteranceFactory,
): SpeechController => {
  if (!synthesis) {
    return {
      speak: async ({ onError }) => {
        const error = { type: "unsupported", message: "Speech synthesis unavailable" }
        onError(error)
        return { ok: false, error }
      },
      cancel: () => {},
    }
  }

  return {
    speak: async ({ text, rate, onBoundary, onEnd, onError }) => {
      return new Promise((resolve) => {
        const utterance = createUtterance(text)
        utterance.rate = rate
        let settled = false
        const fallbackDuration = Math.min(
          Math.max(Math.ceil((text.length / Math.max(rate, 0.1)) * 120), 1200),
          15000,
        )
        const fallbackTimer = globalThis.setTimeout(() => {
          if (settled) {
            return
          }
          settled = true
          onEnd()
          resolve({ ok: true, value: { text } })
        }, fallbackDuration)
        utterance.onboundary = (event) => onBoundary({ charIndex: event.charIndex })
        utterance.onend = () => {
          if (settled) {
            return
          }
          settled = true
          globalThis.clearTimeout(fallbackTimer)
          onEnd()
          resolve({ ok: true, value: { text } })
        }
        utterance.onerror = () => {
          if (settled) {
            return
          }
          settled = true
          globalThis.clearTimeout(fallbackTimer)
          const error = { type: "synthesisError", message: "synthesis" } as const
          onError(error)
          resolve({ ok: false, error })
        }
        synthesis.speak(utterance)
      })
    },
    cancel: () => synthesis.cancel(),
  }
}

const createDefaultUtterance: UtteranceFactory = (text) => {
  return new SpeechSynthesisUtterance(text)
}

export const useSpeechController = (): SpeechController => {
  return useMemo(() => {
    const synthesis = typeof window === "undefined" ? null : window.speechSynthesis
    return createSpeechController(synthesis, createDefaultUtterance)
  }, [])
}
