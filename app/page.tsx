import { getFolders } from '@/actions/folder-actions'
import { TreeView } from '@/components/tree-view'

export default async function Page() {
  const folders = await getFolders()

  return (
    <div className="p-8">
      <TreeView initialFolders={folders} />
    </div>
  )
}

