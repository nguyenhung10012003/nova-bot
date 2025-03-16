import { Logger } from '@nestjs/common';

export interface CrawlOptions {
  urls: string[];
  match: string | string[];
  fileMatch?: string | string[];
  maxUrlsToCrawl?: number;
  exclude?: string | string[];
}

export interface CrawlData {
  url: string;
  title?: string;
  content?: string;
  type?: 'URL' | 'FILE';
}

/**
 * CrawlStreamClient is a client for the crawl stream API.
 * It allows you to stream crawl data from the API.
 * @example
 * const client = new CrawlStreamClient();
 * for await (const data of client.crawlStream({
 *  urls: ['https://example.com'],
 *  match: 'h1',
 * })) {
 * console.log(data);
 * }
 */
export class CrawlStreamClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
  }

  async *crawlStream(params: {
    urls: string[];
    match: string | string[];
    fileMatch?: string | string[];
    exclude?: string | string[];
    maxUrlsToCrawl?: number;
  }): AsyncGenerator<CrawlData, void, unknown> {
    // Construct query string
    const queryParams = new URLSearchParams();

    // Add URLs
    params.urls.forEach((url) => queryParams.append('urls', url));

    // Add match patterns
    const matchPatterns = Array.isArray(params.match)
      ? params.match
      : [params.match];
    matchPatterns.forEach((match) => queryParams.append('match', match));

    // Add file match patterns if exists
    if (params.fileMatch) {
      const fileMatchPatterns = Array.isArray(params.fileMatch)
        ? params.fileMatch
        : [params.fileMatch];
      fileMatchPatterns.forEach((fileMatch) =>
        queryParams.append('fileMatch', fileMatch),
      );
    }

    // Add max URLs to crawl
    if (params.maxUrlsToCrawl) {
      queryParams.append('maxUrlsToCrawl', params.maxUrlsToCrawl.toString());
    }

    // Add exclude patterns if exists
    if (params.exclude) {
      const excludePatterns = Array.isArray(params.exclude)
        ? params.exclude
        : [params.exclude];
      excludePatterns.forEach((exclude) => queryParams.append('exclude', exclude));
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/stream?${queryParams.toString()}`,
        {
          method: 'GET',
        },
      ).catch((error: Error) => {
        // Handle network errors like ECONNRESET
        throw new Error(`Network error: ${error.message || String(error)}`);
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Ensure the response is a readable stream
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      let buffer = '';

      while (true) {
        let done = false;
        let value;
        
        try {
          const result = await reader.read();
          done = result.done;
          value = result.value;
        } catch (error) {
          // Handle errors during stream reading (like ECONNRESET)
          console.error('Error reading from stream:', error);
          throw new Error(`Stream read error: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (done) break;

        // Convert chunk to string and add to buffer
        buffer += new TextDecoder().decode(value);

        // Split by double newline which separates SSE events
        const events = buffer.split('\n\n');

        // Process complete events
        while (events.length > 1) {
          const event = events.shift();
          if (event) {
            // Handle different types of events
            const dataMatch = event.match(/data: (.+)/);
            const eventTypeMatch = event.match(/event: (\w+)/);

            if (eventTypeMatch) {
              const eventType = eventTypeMatch[1];

              if (eventType === 'complete') {
                // End of stream
                return;
              }

              if (eventType === 'error') {
                // Error event
                const errorData = event.match(/data: (.+)/);
                if (errorData) {
                  throw new Error(errorData[1]);
                }
              }
            }

            // Data event
            if (dataMatch) {
              try {
                const data = JSON.parse(dataMatch[1]);
                yield data;
              } catch (parseError) {
                console.error('Error parsing event data:', parseError);
                // Skip this event and continue with the next one
                // This prevents the TypeError from propagating and breaking the stream
                continue;
              }
            }
          }
        }

        // Keep any incomplete event in buffer
        buffer = events[0] || '';
      }
    } catch (error) {
      console.error('Crawl stream error:', error);
      throw error;
    }
  }

  // Convenience method to collect all results
  async crawl(params: {
    urls: string[];
    match: string | string[];
    fileMatch?: string | string[];
    maxUrlsToCrawl?: number;
    exclude?: string | string[];
  }): Promise<CrawlData[]> {
    const results: CrawlData[] = [];

    try {
      for await (const data of this.crawlStream(params)) {
        results.push(data);
      }
      return results;
    } catch (error) {
      // Log the error and return any results collected so far
      console.error('Error during crawl:', error);
      Logger.error(`Crawl error: ${error instanceof Error ? error.message : String(error)}`, 'CrawlStreamClient');
      
      // Return any results we've collected so far instead of failing completely
      return results;
    }
  }
}

export async function crawl(options: CrawlOptions) {
  Logger.debug('Start crawl for urls: ' + options.urls.join(', '), 'Crawl');
  const apiUrl = process.env.CRAWLER_API_URL || 'http://localhost:4000';
  const crawler = new CrawlStreamClient(apiUrl);
  const results = await crawler.crawl(options);
  Logger.debug(`Crawl finished. Number of Result: ${results.length}`, 'Crawl');
  return results;
}
