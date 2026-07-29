import { Prisma } from '@prisma/client';
import prisma from '../db';
import {
  Category,
  Folder,
  Subheading,
  Link,
  LinksHomepageData,
  FolderDetailData,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateFolderRequest,
  UpdateFolderRequest,
  CreateSubheadingRequest,
  UpdateSubheadingRequest,
  CreateLinkRequest,
  UpdateLinkRequest,
  CategoryModel,
  FolderModel,
  SubheadingModel,
  LinkModel
} from '../types/links';

class FolderAccessDeniedError extends Error {
  constructor() {
    super('Folder key is required or invalid');
    this.name = 'FolderAccessDeniedError';
  }
}

export class LinksService {
  private toCategoryDTO(item: CategoryModel): Category {
    return {
      category_id: item.id,
      title: item.title,
      weight: item.weight,
      timestamp: item.createdAt.toISOString()
    };
  }

  private toFolderDTO(item: FolderModel): Folder {
    return {
      folder_id: item.id,
      category_id: item.categoryId,
      is_locked: Boolean(item.accessKey),
      title: item.title,
      weight: item.weight,
      timestamp: item.createdAt.toISOString()
    };
  }

  private toSubheadingDTO(item: SubheadingModel): Subheading {
    return {
      subheading_id: item.id,
      folder_id: item.folderId,
      title: item.title,
      weight: item.weight,
      timestamp: item.createdAt.toISOString()
    };
  }

  private toLinkDTO(item: LinkModel): Link {
    return {
      link_id: item.id,
      category_id: item.categoryId,
      folder_id: item.folderId,
      subheading_id: item.subheadingId,
      title: item.title,
      link: item.url,
      weight: item.weight,
      timestamp: item.createdAt.toISOString()
    };
  }

  async getHomepageData(): Promise<LinksHomepageData> {
    const categories = await prisma.category.findMany({ orderBy: { weight: 'desc' } }) as unknown as CategoryModel[];
    const folders = await prisma.folder.findMany({ orderBy: { weight: 'desc' } }) as unknown as FolderModel[];
    const generalLinks = await prisma.link.findMany({
      where: { categoryId: null, folderId: null, subheadingId: null },
      orderBy: { weight: 'desc' }
    }) as unknown as LinkModel[];
    const categoryLinks = await prisma.link.findMany({
      where: { categoryId: { not: null }, folderId: null, subheadingId: null },
      orderBy: { weight: 'desc' }
    }) as unknown as LinkModel[];

    return {
      categories: categories.map(c => this.toCategoryDTO(c)),
      category_links: categoryLinks.map(l => this.toLinkDTO(l)),
      folders: folders.map(f => this.toFolderDTO(f)),
      general_links: generalLinks.map(l => this.toLinkDTO(l))
    };
  }

  async getFolderDetail(folderId: string, folderKey?: string): Promise<FolderDetailData | null> {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } }) as unknown as FolderModel | null;
    if (!folder) return null;
    if (folder.accessKey && folder.accessKey !== folderKey) {
      throw new FolderAccessDeniedError();
    }

    const subheadings = await prisma.subheading.findMany({
      where: { folderId },
      orderBy: { weight: 'desc' },
      include: {
        links: {
          orderBy: { weight: 'desc' }
        }
      }
    }) as unknown as (SubheadingModel & { links: LinkModel[] })[];

    const directLinks = await prisma.link.findMany({
      where: { folderId, subheadingId: null, categoryId: null },
      orderBy: { weight: 'desc' }
    }) as unknown as LinkModel[];

    return {
      folder: this.toFolderDTO(folder),
      subheadings: subheadings.map(s => ({
        ...this.toSubheadingDTO(s),
        links: s.links.map(l => this.toLinkDTO(l))
      })),
      direct_links: directLinks.map(l => this.toLinkDTO(l))
    };
  }

  async getAllCategories(): Promise<Category[]> {
    const items = await prisma.category.findMany({ orderBy: { weight: 'desc' } }) as unknown as CategoryModel[];
    return items.map(c => this.toCategoryDTO(c));
  }

  async getCategory(id: string): Promise<Category | null> {
    const item = await prisma.category.findUnique({ where: { id } }) as unknown as CategoryModel | null;
    return item ? this.toCategoryDTO(item) : null;
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const item = await prisma.category.create({ data }) as unknown as CategoryModel;
    return this.toCategoryDTO(item);
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const updateData: Prisma.CategoryUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.weight !== undefined) updateData.weight = data.weight;

    const item = await prisma.category.update({ where: { id }, data: updateData }) as unknown as CategoryModel;
    return this.toCategoryDTO(item);
  }

  async deleteCategory(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async getAllFolders(categoryId?: string): Promise<Folder[]> {
    const where = categoryId ? { categoryId } : {};
    const items = await prisma.folder.findMany({ where, orderBy: { weight: 'desc' } }) as unknown as FolderModel[];
    return items.map(f => this.toFolderDTO(f));
  }

  async getFolder(id: string): Promise<Folder | null> {
    const item = await prisma.folder.findUnique({ where: { id } }) as unknown as FolderModel | null;
    return item ? this.toFolderDTO(item) : null;
  }

  async createFolder(data: CreateFolderRequest): Promise<Folder> {
    if (!data.category_id?.trim()) {
      throw new Error('category_id is required to create folder');
    }

    const normalizedAccessKey = data.access_key?.trim() ? data.access_key.trim() : null;
    const createData: Prisma.FolderCreateInput = {
      title: data.title,
      weight: data.weight,
      category: { connect: { id: data.category_id } }
    };

    if (normalizedAccessKey) {
      (createData as unknown as Record<string, unknown>).accessKey = normalizedAccessKey;
    }

    const item = await prisma.folder.create({
      data: createData
    }) as unknown as FolderModel;
    return this.toFolderDTO(item);
  }

  async updateFolder(id: string, data: UpdateFolderRequest): Promise<Folder> {
    const updateData: Prisma.FolderUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.weight !== undefined) updateData.weight = data.weight;

    if (data.category_id !== undefined && data.category_id?.trim()) {
      updateData.category = { connect: { id: data.category_id } };
    }

    if (data.access_key !== undefined) {
      const normalizedAccessKey = data.access_key?.trim() ? data.access_key.trim() : null;
      (updateData as unknown as Record<string, unknown>).accessKey = normalizedAccessKey;
    }
    const item = await prisma.folder.update({ where: { id }, data: updateData }) as unknown as FolderModel;
    return this.toFolderDTO(item);
  }

  async deleteFolder(id: string): Promise<void> {
    await prisma.folder.delete({ where: { id } });
  }

  async getAllSubheadings(): Promise<Subheading[]> {
     const items = await prisma.subheading.findMany({
       orderBy: { weight: 'desc' },
       include: { folder: { select: { title: true } } }
     }) as unknown as SubheadingModel[];
     return items.map(s => this.toSubheadingDTO(s));
  }

  async getSubheading(id: string): Promise<Subheading | null> {
    const item = await prisma.subheading.findUnique({ where: { id } }) as unknown as SubheadingModel | null;
    return item ? this.toSubheadingDTO(item) : null;
  }

  async createSubheading(data: CreateSubheadingRequest): Promise<Subheading> {
    const item = await prisma.subheading.create({
      data: {
        title: data.title,
        weight: data.weight,
        folder: { connect: { id: data.folder_id } }
      }
    }) as unknown as SubheadingModel;
    return this.toSubheadingDTO(item);
  }

  async updateSubheading(id: string, data: UpdateSubheadingRequest): Promise<Subheading> {
    const updateData: Prisma.SubheadingUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.weight !== undefined) updateData.weight = data.weight;

    if (data.folder_id !== undefined) {
      updateData.folder = { connect: { id: data.folder_id } };
    }
    const item = await prisma.subheading.update({ where: { id }, data: updateData }) as unknown as SubheadingModel;
    return this.toSubheadingDTO(item);
  }

  async deleteSubheading(id: string): Promise<void> {
    await prisma.subheading.delete({ where: { id } });
  }

  async getAllLinks(): Promise<Link[]> {
    const items = await prisma.link.findMany({ orderBy: { weight: 'desc' } }) as unknown as LinkModel[];
    return items.map(l => this.toLinkDTO(l));
  }

  async getLink(id: string): Promise<Link | null> {
    const item = await prisma.link.findUnique({ where: { id } }) as unknown as LinkModel | null;
    return item ? this.toLinkDTO(item) : null;
  }

  async createLink(data: CreateLinkRequest): Promise<Link> {
    const createData: Prisma.LinkCreateInput = {
      title: data.title,
      url: data.link,
      weight: data.weight
    };

    if (data.subheading_id) {
      if (data.folder_id) {
        createData.folder = { connect: { id: data.folder_id } };
      }
      createData.subheading = { connect: { id: data.subheading_id } };
    } else if (data.folder_id) {
      createData.folder = { connect: { id: data.folder_id } };
    } else if (data.category_id) {
      createData.category = { connect: { id: data.category_id } };
    }

    const item = await prisma.link.create({ data: createData }) as unknown as LinkModel;
    return this.toLinkDTO(item);
  }

  async updateLink(id: string, data: UpdateLinkRequest): Promise<Link> {
    const currentItem = await prisma.link.findUnique({ where: { id } }) as unknown as LinkModel | null;
    if (!currentItem) {
      throw new Error('Link not found');
    }

    const updateData: Prisma.LinkUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.link !== undefined) updateData.url = data.link;
    if (data.weight !== undefined) updateData.weight = data.weight;

    if (data.subheading_id !== undefined && data.subheading_id !== null) {
      if (data.folder_id !== undefined && data.folder_id !== null) {
        updateData.folder = { connect: { id: data.folder_id } };
      }
      updateData.subheading = { connect: { id: data.subheading_id } };
      updateData.category = { disconnect: true };
      } else if (data.folder_id !== undefined && data.folder_id !== null) {
        updateData.folder = { connect: { id: data.folder_id } };
        updateData.subheading = { disconnect: true };
        updateData.category = { disconnect: true };
      } else if (data.category_id !== undefined && data.category_id !== null) {
        updateData.category = { connect: { id: data.category_id } };
        updateData.folder = { disconnect: true };
        updateData.subheading = { disconnect: true };
      } else {
      if (data.category_id === null) {
        updateData.category = { disconnect: true };
      }
      if (data.folder_id === null) {
        updateData.folder = { disconnect: true };
      }
      if (data.subheading_id === null) {
        updateData.subheading = { disconnect: true };
      }
    }

    const item = await prisma.link.update({ where: { id }, data: updateData }) as unknown as LinkModel;
    return this.toLinkDTO(item);
  }

  async deleteLink(id: string): Promise<void> {
    await prisma.link.delete({ where: { id } });
  }
}

export { FolderAccessDeniedError };
