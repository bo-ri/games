import { describe, expect, it } from "vitest"

import { resolveSpaRedirect } from "./spaRedirect"

describe("resolveSpaRedirect", () => {
  it("returns null when no redirect marker", () => {
    const result = resolveSpaRedirect(
      { pathname: "/", search: "", hash: "" },
      "/",
    )

    expect(result).toBeNull()
  })

  it("restores path for project pages", () => {
    const result = resolveSpaRedirect(
      { pathname: "/kojien/", search: "?/game/1?mode=solo", hash: "#top" },
      "/kojien/",
    )

    expect(result).toBe("/kojien/game/1?mode=solo#top")
  })

  it("restores path for root pages", () => {
    const result = resolveSpaRedirect(
      { pathname: "/", search: "?/game/1", hash: "" },
      "/",
    )

    expect(result).toBe("/game/1")
  })
})
