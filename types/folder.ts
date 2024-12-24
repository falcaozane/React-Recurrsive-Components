export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    parent?: Folder | null;
    children: Folder[]; // Recursive structure for children
    createdAt: Date;
    updatedAt: Date;
  }
  