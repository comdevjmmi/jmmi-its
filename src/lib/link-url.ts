import { baseURL } from '@/lib/api';
import { siteConfig } from '@/constant/config';

type TrackableLink = {
  link: string;
  short_path?: string | null;
};

export const buildApiUrl = (path: string): string => {
  const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  return new URL(normalizedPath, normalizedBase).toString();
};

const shortBaseURL = process.env.NEXT_PUBLIC_SHORT_BASE_URL || siteConfig.url;

export const buildShortUrl = (path: string): string => {
  const normalizedBase = shortBaseURL.endsWith('/') ? shortBaseURL : `${shortBaseURL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  return new URL(normalizedPath, normalizedBase).toString();
};

export const getLinkTargetUrl = (link: TrackableLink): string => {
  return link.link;
};