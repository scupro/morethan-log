import { createNotionAPI, notionGotOptions } from "./client"

export const getRecordMap = async (pageId: string) => {
  const api = createNotionAPI()
  const recordMap = await api.getPage(pageId, { gotOptions: notionGotOptions })
  return recordMap
}
