export type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  modifiedBy?: string;
  createdAt: string;
  url?: string;
  favorite?: boolean;
  folderId: string;
};

export type Folder = {
  id: string;
  name: string;
  parentId?: string;
  path?: string;
  createdAt: string;
  modifiedAt?: string;
};
