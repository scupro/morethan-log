import { idToUuid } from "notion-utils"
import { ExtendedRecordMap, ID } from "notion-types"

export default function getAllPageIds(
  response: ExtendedRecordMap,
  viewId?: string
) {
  const collectionQuery = response.collection_query
  const views = collectionQuery
    ? Object.values(collectionQuery)[0]
    : undefined

  let pageIds: ID[] = []
  if (viewId && views) {
    const vId = idToUuid(viewId)
    pageIds = views[vId]?.blockIds || []
  } else if (views) {
    const pageSet = new Set<ID>()
    Object.values(views).forEach((view: any) => {
      view?.collection_group_results?.blockIds?.forEach((id: ID) =>
        pageSet.add(id)
      )
      view?.blockIds?.forEach((id: ID) => pageSet.add(id))
    })
    pageIds = [...pageSet]
  }

  if (pageIds.length === 0 && response.block) {
    pageIds = Object.keys(response.block).filter((id) => {
      const raw = response.block[id]?.value as any
      const block = raw?.value ?? raw
      return block?.type === "page" && block?.parent_table === "collection"
    })
  }

  return pageIds
}
