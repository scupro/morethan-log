import { NotionAPI } from "notion-client"

export const notionGotOptions = {
  headers: {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  },
}

export const createNotionAPI = () =>
  new NotionAPI({
    apiBaseUrl: "https://app.notion.com/api/v3",
  })
