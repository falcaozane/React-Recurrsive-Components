export interface Folder {
    id: string
    name: string
    parentId: string | null
    parent?: Folder | null
    children: Folder[]
    createdAt: Date
    updatedAt: Date
  }