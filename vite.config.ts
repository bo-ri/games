import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolvePagesBasePath } from "./src/lib/deploy/pagesBase"

const base = resolvePagesBasePath(
  process.env.BASE_PATH,
  process.env.GITHUB_REPOSITORY,
)

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
})
