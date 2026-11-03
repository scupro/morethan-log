import { NotionAPI } from "notion-client"

const NOTION_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

export const notionGotOptions = {
  headers: {
    "user-agent": NOTION_USER_AGENT,
  },
}

export const createNotionAPI = () => {
  const api = new NotionAPI({
    apiBaseUrl: "https://app.notion.com/api/v3",
  })
  const originalFetch = api.fetch.bind(api)

  api.fetch = (async (args: any) => {
    const body = args?.body
    if (
      args?.endpoint === "queryCollection" &&
      body &&
      typeof body === "object" &&
      !body.source &&
      body.collection?.id
    ) {
      body.source = { type: "collection", id: body.collection.id }
    }

    return originalFetch({
      ...args,
      gotOptions: {
        ...args?.gotOptions,
        headers: {
          ...notionGotOptions.headers,
          ...args?.gotOptions?.headers,
        },
      },
    })
  }) as typeof api.fetch

  return api
}
