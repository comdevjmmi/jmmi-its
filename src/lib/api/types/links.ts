export interface Category {
  category_id: string;
  title: string;
  weight: number;
  timestamp: string;
}

export interface Folder {
  folder_id: string;
  category_id: string | null;
  is_locked: boolean;
  title: string;
  weight: number;
  timestamp: string;
}

export interface Subheading {
  subheading_id: string;
  folder_id: string;
  title: string;
  weight: number;
  timestamp: string;
}

export interface Link {
  link_id: string;
  category_id: string | null;
  folder_id: string | null;
  subheading_id: string | null;
  title: string;
  link: string;
  weight: number;
  timestamp: string;
}

export interface LinksHomepageData {
  categories: Category[];
  category_links: Link[];
  folders: Folder[];
  general_links: Link[];
}

export interface FolderDetailData {
  folder: Folder;
  subheadings: (Subheading & { links: Link[] })[];
  direct_links: Link[];
}

export interface CreateCategoryRequest {
  title: string;
  weight: number;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface CreateFolderRequest {
  title: string;
  weight: number;
  category_id?: string | null;
  access_key?: string | null;
}

export type UpdateFolderRequest = Partial<CreateFolderRequest>;

export interface CreateSubheadingRequest {
  folder_id: string;
  title: string;
  weight: number;
}

export type UpdateSubheadingRequest = Partial<CreateSubheadingRequest>;

export interface CreateLinkRequest {
  category_id?: string | null;
  folder_id?: string | null;
  subheading_id?: string | null;
  title: string;
  link: string;
  weight: number;
}

export type UpdateLinkRequest = Partial<CreateLinkRequest>;

export interface CategoryModel {
  id: string;
  title: string;
  weight: number;
  createdAt: Date;
}

export interface FolderModel {
  id: string;
  categoryId: string;
  accessKey: string | null;
  title: string;
  weight: number;
  createdAt: Date;
}

export interface SubheadingModel {
  id: string;
  folderId: string;
  title: string;
  weight: number;
  createdAt: Date;
}

export interface LinkModel {
  id: string;
  categoryId: string | null;
  folderId: string | null;
  subheadingId: string | null;
  title: string;
  url: string;
  weight: number;
  createdAt: Date;
}
