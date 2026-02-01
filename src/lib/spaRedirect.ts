type RedirectLocation = {
  pathname: string
  search: string
  hash: string
}

const normalizeBasePath = (value: string): string => {
  if (!value) {
    return "/"
  }

  if (value === "/") {
    return "/"
  }

  const withLeading = value.startsWith("/") ? value : `/${value}`
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`
}

const stripLeadingSlash = (value: string): string => {
  return value.startsWith("/") ? value.slice(1) : value
}

export const resolveSpaRedirect = (
  location: RedirectLocation,
  basePath: string,
): string | null => {
  if (!location.search.startsWith("?/")) {
    return null
  }

  const normalizedBase = normalizeBasePath(basePath)
  const encoded = location.search.slice(2)
  const queryIndex = encoded.indexOf("?")
  const pathPart = queryIndex === -1 ? encoded : encoded.slice(0, queryIndex)
  const queryPart = queryIndex === -1 ? "" : encoded.slice(queryIndex + 1)
  const normalizedPath = stripLeadingSlash(pathPart)
  const newPath = normalizedPath
    ? `${normalizedBase}${normalizedPath}`
    : normalizedBase
  const querySuffix = queryPart ? `?${queryPart}` : ""

  return `${newPath}${querySuffix}${location.hash}`
}
