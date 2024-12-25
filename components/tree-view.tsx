'use client'

import { useState } from 'react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const childFolders = allFolders.filter((f) => f.parentId === folder.id)
  const hasChildren = childFolders.length > 0

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleRename = async (e?: React.FocusEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    if (!newName.trim() || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      await renameFolder(folder.id, newName.trim())
      await onFolderUpdate()
      setIsRenaming(false)
    } catch (error) {
      console.error('Failed to rename folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return
    
    try {
      setIsSubmitting(true)
      await deleteFolder(folder.id)
      await onFolderUpdate()
    } catch (error) {
      console.error('Failed to delete folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateSubfolder = async (e?: React.FocusEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    if (!newSubfolderName.trim() || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      await createFolder(newSubfolderName.trim(), folder.id)
      setIsCreatingSubfolder(false)
      setNewSubfolderName('')
      setIsExpanded(true)
      await onFolderUpdate()
    } catch (error) {
      console.error('Failed to create subfolder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="select-none">
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-sm cursor-pointer"
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={handleToggle}
            role="button"
            aria-expanded={isExpanded}
            tabIndex={0}
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
              <form onSubmit={(e) => { e.preventDefault(); handleRename(); }}>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(e)}
                  className="h-6 w-40"
                  autoFocus
                  disabled={isSubmitting}
                />
              </form>
            ) : (
              <span className="text-sm">{folder.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem 
            onClick={() => setIsRenaming(true)}
            disabled={isSubmitting}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => setIsCreatingSubfolder(true)}
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Subfolder
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={handleDelete}
            disabled={isSubmitting}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isCreatingSubfolder && (
        <form 
          className="flex items-center mt-1" 
          style={{ paddingLeft: `${(level + 1) * 16}px` }}
          onSubmit={(e) => { e.preventDefault(); handleCreateSubfolder(); }}
        >
          <Input
            value={newSubfolderName}
            onChange={(e) => setNewSubfolderName(e.target.value)}
            onBlur={() => !newSubfolderName.trim() && setIsCreatingSubfolder(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubfolder(e)
              if (e.key === 'Escape') setIsCreatingSubfolder(false)
            }}
            className="h-6 w-40 mr-2"
            placeholder="New subfolder name"
            autoFocus
            disabled={isSubmitting}
          />
          <Button 
            onClick={() => handleCreateSubfolder()} 
            size="sm"
            disabled={isSubmitting}
          >
            Create
          </Button>
        </form>
      )}
      {isExpanded && hasChildren && (
        <div role="group" aria-label={`${folder.name} subfolders`}>
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const rootFolders = folders.filter((folder) => folder.parentId === null)

  const handleCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newFolderName.trim() || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      await createFolder(newFolderName.trim(), null)
      setNewFolderName('')
      setIsDialogOpen(false)
      await updateFolders()
    } catch (error) {
      console.error('Failed to create folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFolders = async () => {
    try {
      const updatedFolders = await getFolders()
      setFolders(updatedFolders)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }

  return (
    <div className="w-full border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                disabled={isSubmitting || !newFolderName.trim()}
              >
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-1">
        {rootFolders.map((folder) => (
          <TreeNode 
            key={folder.id} 
            folder={folder} 
            allFolders={folders} 
            level={0} 
            onFolderUpdate={updateFolders} 
          />
        ))}
      </div>
    </div>
  )
}