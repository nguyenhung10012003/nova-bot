export const urlIsSitemap = (url: string) => {
  return /sitemap.*\.xml$/.test(url);
};


export function isValidUrl(url: string): boolean {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // Protocol (optional)
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // Domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IPv4 address
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // Port and path
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Query parameters
      '(\\#[-a-zA-Z\\d_]*)?$', // Fragment
    'i',
  );

  return urlPattern.test(url);
}