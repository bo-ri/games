const normalizeBasePath = (value: string): string => {
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "/") {
    return "/"
  }

  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`
}

export const resolvePagesBasePath = (
  explicitBasePath?: string,
  repository?: string,
): string => {
  if (explicitBasePath && explicitBasePath.trim() !== "") {
    return normalizeBasePath(explicitBasePath)
  }

  if (!repository) {
    return "/"
  }

  const [owner, repo] = repository.split("/")
  if (!owner || !repo) {
    return "/"
  }

  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return "/"
  }

  return normalizeBasePath(repo)
}
