// Link Management Types - Linktree Style

export interface Category {
  category_id: string; // UUID
  title: string;
  weight: number;
  timestamp: string; // ISO Date
}

export interface Folder {
  folder_id: string; // UUID
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
  link: string; // The URL
  weight: number;
  timestamp: string;
}

export interface ShortLink {
  short_link_id: string;
  short_code: string;
  short_path: string;
  url: string;
  click_count: number;
  timestamp: string;
}

// --- Response Payloads ---

export type SubheadingWithLinks = Subheading & { links: Link[] };

export interface LinksHomepageData {
  categories: Category[];
  category_links: Link[];
  folders: Folder[];
  general_links: Link[];
}

export interface FolderDetailData {
  folder: Folder;
  subheadings: SubheadingWithLinks[];
  direct_links: Link[]; // Links directly in folder, no subheading
}

// --- Request Payloads (For Admin Forms) ---

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
  title: string;
  weight: number;
  folder_id: string;
}

export type UpdateSubheadingRequest = Partial<CreateSubheadingRequest>;

export interface CreateLinkRequest {
  title: string;
  link: string;
  weight: number;
  folder_id?: string | null;
  subheading_id?: string | null;
}

export type UpdateLinkRequest = Partial<CreateLinkRequest>;
