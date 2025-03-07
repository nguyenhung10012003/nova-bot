import { Logger } from "@nestjs/common";

export interface CrawlOptions {
  urls: string[];
  match: string | string[];
  fileMatch?: string | string[];
  maxUrlsToCrawl?: number;
}

export interface CrawlData {
  url: string;
  title?: string;
  content?: string;
  type?: string;
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
    maxUrlsToCrawl?: number;
  }): AsyncGenerator<CrawlData, void, unknown> {
    // Construct query string
    const queryParams = new URLSearchParams();
    
    // Add URLs
    params.urls.forEach(url => queryParams.append('urls', url));
    
    // Add match patterns
    const matchPatterns = Array.isArray(params.match) 
      ? params.match 
      : [params.match];
    matchPatterns.forEach(match => queryParams.append('match', match));
    
    // Add file match patterns if exists
    if (params.fileMatch) {
      const fileMatchPatterns = Array.isArray(params.fileMatch) 
        ? params.fileMatch 
        : [params.fileMatch];
      fileMatchPatterns.forEach(fileMatch => queryParams.append('fileMatch', fileMatch));
    }
    
    // Add max URLs to crawl
    if (params.maxUrlsToCrawl) {
      queryParams.append('maxUrlsToCrawl', params.maxUrlsToCrawl.toString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/stream?${queryParams.toString()}`, {
        method: 'GET'
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
        const { done, value } = await reader.read();

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
  }): Promise<CrawlData[]> {
    const results: CrawlData[] = [];
    
    for await (const data of this.crawlStream(params)) {
      results.push(data);
    }
    
    return results;
  }
}

export async function crawl(options: CrawlOptions) {
  Logger.debug("Start crawl for urls: " + options.urls.join(", "), "Crawl");
  const apiUrl = process.env.CRAWLER_API_URL || 'http://localhost:4000';
  const crawler = new CrawlStreamClient(apiUrl);
  const results = await crawler.crawl(options);
  Logger.debug(`Crawl finished. Number of Result: ${results.length}`, "Crawl");
  return results;
}
