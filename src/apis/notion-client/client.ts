import { NotionAPI } from "notion-client"

const NOTION_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

export const notionGotOptions = {
  headers: {
    "user-agent": NOTION_USER_AGENT,
  },
}

// Notion now wraps every record as `{ spaceId, value: { value, role } }`.
// notion-client 6.x only unwraps one level, so blocks/users look empty and
// collections are never detected. Restore the flat `{ spaceId, value }` shape.
const RECORD_MAP_TABLES = [
  "block",
  "collection",
  "collection_view",
  "notion_user",
  "space",
]

function normalizeRecordMap(recordMap: any) {
  if (!recordMap || typeof recordMap !== "object") return
  for (const table of RECORD_MAP_TABLES) {
    const records = recordMap[table]
    if (!records || typeof records !== "object") continue
    for (const key of Object.keys(records)) {
      const entry = records[key]
      const inner = entry?.value?.value
      if (inner && typeof inner === "object") {
        entry.value = inner
      }
    }
  }
}

function normalizeResponse(response: any) {
  if (!response || typeof response !== "object") return response
  normalizeRecordMap(response.recordMap)
  normalizeRecordMap(response.recordMapWithRoles)
  normalizeRecordMap(response)
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
