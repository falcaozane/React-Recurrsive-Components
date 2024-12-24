'use client'

import * as React from 'react'
import { ChevronRight, ChevronDown, FolderIcon, Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createFolder, deleteFolder, renameFolder } from '@/actions/folder-actions'
import type { Folder } from '@prisma/client'

interface TreeNodeProps {
  folder: Folder
  allFolders: Folder[]
  level: number
}

function TreeNode({ folder, allFolders, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(folder.name)

  const childFolders = allFolders.filter((f) => f.parentId === folder.id)
  const hasChildren = childFolders.length > 0

  const handleToggle = () => setIsExpanded(!isExpanded)

  const handleRename = async () => {
    await renameFolder(folder.id, newName)
    setIsRenaming(false)
  }

  const handleDelete = async () => {
    await deleteFolder(folder.id)
  }

  return (
    <div className="select-none">
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-sm cursor-pointer"
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={handleToggle}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )
            ) : (
              <span className="w-4" />
            )}
            <FolderIcon className="h-4 w-4 shrink-0 text-blue-500" />
            {isRenaming ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="h-6 w-40"
                autoFocus
              />
            ) : (
              <span className="text-sm">{folder.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsRenaming(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isExpanded && hasChildren && (
        <div>
          {childFolders.map((childFolder) => (
            <TreeNode
              key={childFolder.id}
              folder={childFolder}
              allFolders={allFolders}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeViewProps {
  folders: Folder[]
}

export function TreeView({ folders }: TreeViewProps) {
  const [newFolderName, setNewFolderName] = React.useState('')
  const rootFolders = folders.filter((folder) => folder.parentId === null)

  const handleCreateFolder = async () => {
    await createFolder(newFolderName, null)
    setNewFolderName('')
  }

  return (
    <div className="w-64 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button onClick={handleCreateFolder}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-1">
        {rootFolders.map((folder) => (
          <TreeNode key={folder.id} folder={folder} allFolders={folders} level={0} />
        ))}
      </div>
    </div>
  )
}

