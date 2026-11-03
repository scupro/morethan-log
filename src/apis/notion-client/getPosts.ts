import { CONFIG } from "site.config"
import { idToUuid } from "notion-utils"
import { createNotionAPI, notionGotOptions } from "./client"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async (): Promise<TPosts> => {
  try {
    let id = CONFIG.notionConfig.pageId as string
    if (!id) return []
    const api = createNotionAPI()

    const response = await api.getPage(id, { gotOptions: notionGotOptions })
    id = idToUuid(id)
    const collectionValue = Object.values(response.collection || {})[0]
      ?.value as any
    const collection = collectionValue?.value ?? collectionValue
    const block = response.block
    const schema = collection?.schema
    const pageBlock = block?.[id]
    if (!pageBlock) return []

    const blockValue = (pageBlock.value as any)?.value ?? pageBlock.value
    const rawMetadata = blockValue

    if (
      rawMetadata?.type !== "collection_view_page" &&
      rawMetadata?.type !== "collection_view"
    ) {
      return []
    }

    const pageIds = getAllPageIds(response)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i]
      const properties = (await getPageProperties(pageId, block, schema)) || null
      if (!properties) continue
      const pageBlockValue =
        (block[pageId]?.value as any)?.value ?? block[pageId]?.value
      properties.createdTime = new Date(
        pageBlockValue?.created_time
      ).toString()
      properties.fullWidth =
        (pageBlockValue?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    return data as TPosts
  } catch (error) {
    console.error("getPosts failed", error)
    return []
  }
}
