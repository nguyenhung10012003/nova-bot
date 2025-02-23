export interface CrawlOptions {
  urls: string[];
  match: string | string[];
  maxUrlsToCrawl?: number;
  fileMatch?: string;
}

export async function crawl(options: CrawlOptions) {
  const apiUrl = process.env.CRAWLER_API_URL || 'http://localhost:4000';
  const fetchUrl = new URL(apiUrl);
  fetchUrl.pathname = '/crawl';
  fetchUrl.searchParams.set('urls', options.urls.join(','));
  fetchUrl.searchParams.set(
    'match',
    Array.isArray(options.match) ? options.match.join(',') : options.match,
  );
  fetchUrl.searchParams.set(
    'maxUrlsToCrawl',
    options.maxUrlsToCrawl ? options.maxUrlsToCrawl.toString() : '25',
  );
  fetchUrl.searchParams.set('fileMatch', options.fileMatch || '');

  try {
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (e: any) {
    throw new Error(e);
  }
}
