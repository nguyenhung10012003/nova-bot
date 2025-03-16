import { minimatch } from 'minimatch';

export const urlIsSitemap = (url: string) => {
  return /sitemap.*\.xml$/.test(url);
};

export const checkUrlMatch = (url: string, match: string[] | string) => {
  return Array.isArray(match)
    ? match.some((pattern) => minimatch(url, pattern))
    : minimatch(url, match);
};

export const checkExtensionMatch = (
  fileExtension: string,
  extensionMatch?: string[] | string,
) => {
  if (!extensionMatch) return false;
  return Array.isArray(extensionMatch)
    ? extensionMatch.includes(fileExtension)
    : extensionMatch === fileExtension;
};
