import { NotionAPI } from "notion-client"

const NOTION_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

export const notionGotOptions = {
  headers: {
    "user-agent": NOTION_USER_AGENT,
  },
}

// Notion now wraps every value as `{ spaceId, value: { value, role } }`.
// notion-client 6.x only unwraps one level, so blocks look empty and
// collections are never detected. Restore the flat `{ spaceId, value }` shape.
function normalizeBlockMap(blockMap: any) {
  if (!blockMap || typeof blockMap !== "object") return
  for (const key of Object.keys(blockMap)) {
    const entry = blockMap[key]
    const inner = entry?.value?.value
    if (inner && typeof inner === "object") {
      entry.value = inner
    }
  }
}

function normalizeResponse(response: any) {
  if (!response || typeof response !== "object") return response
  normalizeBlockMap(response.recordMap?.block)
  normalizeBlockMap(response.block)
  return response
}

export const createNotionAPI = () => {
  const api = new NotionAPI({
    apiBaseUrl: "https://app.notion.com/api/v3",
  })
  const originalFetch = api.fetch.bind(api)

  api.fetch = (async (args: any) =>
    normalizeResponse(await originalFetch(args))) as typeof api.fetch

  return api
}
