'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import type { Folder } from '@/types/folder';

export async function createFolder(name: string, parentId: string | null) {
  const folder = await db.folder.create({
    data: {
      name,
      parentId,
    },
  })
  revalidatePath('/')
  return folder
}

export async function deleteFolder(id: string) {
  await db.folder.delete({
    where: { id },
  })
  revalidatePath('/')
}

export async function renameFolder(id: string, name: string) {
  await db.folder.update({
    where: { id },
    data: { name },
  })
  revalidatePath('/')
}

export async function getFolders(): Promise<Folder[]> {
  const folders = await db.folder.findMany()
  return folders.map((folder) => ({
    ...folder,
    children: [],
  }))
}

