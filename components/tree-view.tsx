'use client'

import {useState,} from 'react'
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
import { createFolder, deleteFolder, renameFolder, getFolders } from '@/actions/folder-actions'
import type { Folder } from '@/types/folder'

interface TreeNodeProps {
  folder: Folder
  allFolders: Folder[]
  level: number
  onFolderUpdate: () => Promise<void>
}

function TreeNode({ folder, allFolders, level, onFolderUpdate }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(folder.name)
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false)
  const [newSubfolderName, setNewSubfolderName] = useState('')

  const childFolders = allFolders.filter((f) => f.parentId === folder.id)
  const hasChildren = childFolders.length > 0

  const handleToggle = () => setIsExpanded(!isExpanded)

  const handleRename = async () => {
    await renameFolder(folder.id, newName)
    setIsRenaming(false)
    onFolderUpdate()
  }

  const handleDelete = async () => {
    await deleteFolder(folder.id)
    onFolderUpdate()
  }

  const handleCreateSubfolder = async () => {
    await createFolder(newSubfolderName, folder.id)
    setIsCreatingSubfolder(false)
    setNewSubfolderName('')
    setIsExpanded(true)
    onFolderUpdate()
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
          <ContextMenuItem onClick={() => setIsCreatingSubfolder(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Subfolder
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isCreatingSubfolder && (
        <div className="flex items-center mt-1" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
          <div className="flex items-center mt-1" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
              <Input
                value={newSubfolderName}
                onChange={(e) => setNewSubfolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSubfolder()}
                className="h-6 w-40 mr-2"
                placeholder="New subfolder name"
                autoFocus
              />
              <Button
                onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from being triggered
                onClick={handleCreateSubfolder}
                size="sm"
              >
                Create
              </Button>
          </div>
        </div>
      )}
      {isExpanded && hasChildren && (
        <div>
          {childFolders.map((childFolder) => (
            <TreeNode
              key={childFolder.id}
              folder={childFolder}
              allFolders={allFolders}
              level={level + 1}
              onFolderUpdate={onFolderUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeViewProps {
  initialFolders: Folder[]
}

export function TreeView({ initialFolders }: TreeViewProps) {
  const [folders, setFolders] = useState(initialFolders)
  const [newFolderName, setNewFolderName] = useState('')

  const rootFolders = folders.filter((folder) => folder.parentId === null)

  const handleCreateFolder = async () => {
    await createFolder(newFolderName, null)
    setNewFolderName('')
    updateFolders()
  }

  const updateFolders = async () => {
    const updatedFolders = await getFolders()
    setFolders(updatedFolders)
  }

  return (
    <div className="w-full border rounded-lg p-4">
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
          <TreeNode key={folder.id} folder={folder} allFolders={folders} level={0} onFolderUpdate={updateFolders} />
        ))}
      </div>
    </div>
  )
}

