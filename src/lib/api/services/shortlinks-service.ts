import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import prisma from '../db';
import {
  ShortLink,
  ShortLinkModel,
  CreateShortLinkRequest,
  UpdateShortLinkRequest
} from '../types/shortlinks';

export class ShortLinksService {
  private buildShortPath(shortCode: string): string {
    return `/s/${shortCode}`;
  }

  private normalizeShortCode(value: string): string | null {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);

    return normalized || null;
  }

  private async ensureUniqueShortCode(
    preferredCode: string,
    excludeId?: string
  ): Promise<string> {
    let candidate = preferredCode;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const existing = await prisma.shortLink.findFirst({
        where: excludeId
          ? { shortCode: candidate, NOT: { id: excludeId } }
          : { shortCode: candidate },
        select: { id: true }
      });

      if (!existing) {
        return candidate;
      }

      candidate = `${preferredCode}-${randomBytes(2).toString('hex')}`;
    }

    return `${preferredCode}-${randomBytes(4).toString('hex')}`;
  }

  private async resolveShortCode(
    _url: string,
    shortCode?: string | null,
    excludeId?: string
  ): Promise<string> {
    const normalizedShortCode = shortCode ? this.normalizeShortCode(shortCode) : null;
    const baseCode = normalizedShortCode || `s-${randomBytes(3).toString('hex')}`;

    return this.ensureUniqueShortCode(baseCode, excludeId);
  }

  private normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  private toDTO(item: ShortLinkModel): ShortLink {
    return {
      short_link_id: item.id,
      short_code: item.shortCode,
      short_path: this.buildShortPath(item.shortCode),
      url: item.url,
      click_count: item.clickCount,
      timestamp: item.createdAt.toISOString()
    };
  }

  async getAll(page = 1, limit = 10, search = ''): Promise<{ data: ShortLink[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const whereClause: Record<string, unknown> = search.trim() ? {
      OR: [
        { shortCode: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [items, total] = await Promise.all([
      prisma.shortLink.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      }) as unknown as Promise<ShortLinkModel[]>,
      prisma.shortLink.count({ where: whereClause })
    ]);
    return {
      data: items.map(i => this.toDTO(i)),
      total,
      page,
      limit
    };
  }

  async getById(id: string): Promise<ShortLink | null> {
    const item = await prisma.shortLink.findUnique({ where: { id } }) as unknown as ShortLinkModel | null;
    return item ? this.toDTO(item) : null;
  }

  async redirectShortLink(shortCode: string): Promise<ShortLink | null> {
    const item = await prisma.shortLink.findUnique({ where: { shortCode } }) as unknown as ShortLinkModel | null;
    if (!item) {
      return null;
    }

    await prisma.shortLink.update({
      where: { id: item.id },
      data: { clickCount: { increment: 1 } }
    });

    return this.toDTO(item);
  }

  async create(data: CreateShortLinkRequest): Promise<ShortLink> {
    const normalizedUrl = this.normalizeUrl(data.url);
    const shortCode = await this.resolveShortCode(normalizedUrl, data.short_code);
    const item = await prisma.shortLink.create({
      data: {
        url: normalizedUrl,
        shortCode
      }
    }) as unknown as ShortLinkModel;
    return this.toDTO(item);
  }

  async update(id: string, data: UpdateShortLinkRequest): Promise<ShortLink> {
    const currentItem = await prisma.shortLink.findUnique({ where: { id } }) as unknown as ShortLinkModel | null;
    if (!currentItem) {
      throw new Error('Short link not found');
    }

    const updateData: Prisma.ShortLinkUpdateInput = {};
    let newUrl: string | undefined = undefined;
    if (data.url !== undefined) {
      newUrl = this.normalizeUrl(data.url);
      updateData.url = newUrl;
    }

    if (data.short_code !== undefined) {
      const codeSource = data.short_code?.trim() || currentItem.shortCode;
      const shortCode = await this.resolveShortCode(newUrl || currentItem.url, codeSource, id);
      updateData.shortCode = shortCode;
    }

    const item = await prisma.shortLink.update({ where: { id }, data: updateData }) as unknown as ShortLinkModel;
    return this.toDTO(item);
  }

  async delete(id: string): Promise<void> {
    await prisma.shortLink.delete({ where: { id } });
  }
}
