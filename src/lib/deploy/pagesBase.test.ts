import { describe, expect, it } from "vitest"

import { resolvePagesBasePath } from "./pagesBase"

describe("resolvePagesBasePath", () => {
  it("returns normalized explicit base path", () => {
    expect(resolvePagesBasePath("kojien")).toBe("/kojien/")
    expect(resolvePagesBasePath("/kojien")).toBe("/kojien/")
    expect(resolvePagesBasePath("/kojien/")).toBe("/kojien/")
  })

  it("returns root when explicit base is root", () => {
    expect(resolvePagesBasePath("/")).toBe("/")
  })

  it("returns root for user or organization pages", () => {
    expect(resolvePagesBasePath(undefined, "octo/octo.github.io")).toBe("/")
  })

  it("returns repo-based path for project pages", () => {
    expect(resolvePagesBasePath(undefined, "octo/kojien-carta")).toBe(
      "/kojien-carta/",
    )
  })

  it("falls back to root when repository is unknown", () => {
    expect(resolvePagesBasePath()).toBe("/")
  })
})
