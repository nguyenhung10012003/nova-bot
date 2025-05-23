import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import { Observable, Subject } from 'rxjs';
import { checkExtensionMatch, checkUrlMatch } from '../utils/url';
import {
  getFileExtension,
  getPageHtml,
  isUrlInCollection,
  normalizeUrl,
  waitForXPath,
} from './utils';

export type RequestHandler = (
  page: Page,
  url: string,
  push: (urls: string[]) => void,
  deleteUrl: (url: string) => void,
) => Promise<void>;

export interface CrawlerOptions {
  requestHandler: RequestHandler;
  maxUrlsToCrawl?: number;
  maxConcurrencies?: number;
  launchOptions?: LaunchOptions;
}

/**
 * A simple web crawler
 * @example
 * const crawler = new Crawler({
 *   requestHandler: async (page, url, push) => {
 *     const title = await page.title();
 *     console.log(`Crawled: ${url}, Title: ${title}`);
 *     const links = await page.evaluate(() =>
 *       Array.from(document.querySelectorAll("a")).map((a) => a.href)
 *     );
 *     push(links);
 *   },
 *   maxUrlsToCrawl: 10,
 *   maxConcurrencies: 5,
 * });
 *
 * crawler.start(["https://example.com"]);
 */
export class Crawler {
  private browser: Browser | null = null;
  private requestHandler: RequestHandler;
  private maxUrlsToCrawl: number;
  private maxConcurrencies: number;
  private urlQueue: string[] = [];
  private activeCrawls: number = 0;
  private crawledUrls: Set<string> = new Set();
  private launchOptions: LaunchOptions;
  private isRunning: boolean = false; // Để ngăn việc đóng trình duyệt khi còn URL cần xử lý

  constructor(options: CrawlerOptions) {
    this.requestHandler = options.requestHandler;
    this.maxUrlsToCrawl = options.maxUrlsToCrawl || 10;
    this.maxConcurrencies = options.maxConcurrencies || 20;
    this.launchOptions = options.launchOptions || {
      headless: !process.env.PUPPETEER_HEADLESS,
      executablePath: process.env.PUPPETEER_EXCUATABLE_PATH,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    };
  }

  async start(startUrls: string[]): Promise<void> {
    this.push(startUrls);
    this.browser = await puppeteer.launch(this.launchOptions);
    this.isRunning = true;

    return new Promise<void>((resolve) => {
      this.processQueue(resolve);
    });
  }

  private async processQueue(resolve: () => void) {
    while (
      this.isRunning &&
      this.activeCrawls < this.maxConcurrencies &&
      this.urlQueue.length > 0
    ) {
      const url = this.urlQueue.shift();
      if (!url) break;

      this.activeCrawls++;
      this.crawl(url).finally(() => {
        this.activeCrawls--;
        if (this.urlQueue.length > 0) {
          this.processQueue(resolve);
        } else if (this.activeCrawls === 0) {
          this.stop().then(resolve); // Đợi stop() hoàn thành trước khi resolve
        }
      });
    }
  }

  private async crawl(url: string) {
    if (
      !this.browser ||
      this.maxUrlsToCrawl-- <= 0 ||
      this.crawledUrls.has(url)
    )
      return;
    let page: Page | null = null;

    try {
      this.crawledUrls.add(url);
      page = await this.browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.requestHandler(
        page,
        url,
        this.push.bind(this),
        this.deleteUrl.bind(this),
      );
    } catch (error) {
      this.crawledUrls.delete(url);
      this.maxUrlsToCrawl++;
      console.error(`Error crawling ${url}:`, error);
    } finally {
      if (page) await page.close();
    }
  }

  push(urls: string[]) {
    urls.forEach((url) => {
      if (
        !isUrlInCollection(this.crawledUrls, url) &&
        !isUrlInCollection(this.urlQueue, url)
      ) {
        this.urlQueue.push(normalizeUrl(url));
      }
    });
  }

  addToCrawledUrls(urls: string[]) {
    urls.forEach((url) => {
      this.crawledUrls.add(url);
    });
  }

  deleteUrl(url: string) {
    this.crawledUrls.delete(url);
  }

  private async stop() {
    this.isRunning = false;
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export interface CrawlOptions {
  urls: string[];
  selector?: string;
  ignoreSelector?: string;
  waitForSelectorTimeout?: number;
  match: string | string[];
  exclude?: string | string[];
  maxUrlsToCrawl?: number;
  maxConcurrencies?: number;
  file?: {
    extensionMatch: string | string[];
  };
}

export function crawlStream<T = any>(options: CrawlOptions): Observable<T> {
  const dataSubject = new Subject<T>();

  const crawler = new Crawler({
    requestHandler: async (page, url, push, _deleteUrl) => {
      try {
        // Wait for the selector to appear on the page
        if (options.selector) {
          if (options.selector.startsWith('/')) {
            await waitForXPath(
              page,
              options.selector,
              options.waitForSelectorTimeout ?? 1000,
            );
          } else {
            await page.waitForSelector(options.selector, {
              timeout: options.waitForSelectorTimeout ?? 1000,
            });
          }
        }

        // Get all the links on the page
        const urls = await page.evaluate(() => {
          const anchorElements = Array.from(document.querySelectorAll('a'));
          const uniqueUrls = new Set(
            anchorElements.map((a) => {
              const href = (a as HTMLAnchorElement).href;
              if (href.startsWith('tel:') || href.startsWith('mailto:')) {
                return '';
              }
              return new URL(href, window.location.origin).href;
            }),
          );
          return Array.from(uniqueUrls);
        });

        let filteredUrls = urls;
        if (options.match || options.file?.extensionMatch || options.exclude) {
          filteredUrls = urls.filter((link) => {
            if (!link) return false;
            if (!checkUrlMatch(link, options.match)) return false;
            if (options.exclude && checkUrlMatch(link, options.exclude))
              return false;

            const fileExtension = getFileExtension(link);
            if (fileExtension) {
              if (
                checkExtensionMatch(fileExtension, options.file?.extensionMatch)
              ) {
                dataSubject.next({ url: link, type: 'FILE' } as T);
              }
              return false;
            }
            return true;
          });
          push(filteredUrls);
        }

        // Get the page title and content
        const title = await page.title();
        const content = await getPageHtml(
          page,
          options.selector,
          options.ignoreSelector,
        );

        // Emit data page
        dataSubject.next({ url, title, content } as T);
      } catch (error) {
        // Optionally emit errors through the subject
        dataSubject.error(error);
      }
    },
    maxUrlsToCrawl: options.maxUrlsToCrawl,
    maxConcurrencies: options.maxConcurrencies,
  });

  // Start crawling and handle completion
  crawler
    .start(options.urls)
    .then(() => dataSubject.complete())
    .catch((error) => dataSubject.error(error));

  return dataSubject.asObservable();
}

// Hàm hỗ trợ sử dụng
export function useCrawlStream<T = any>(options: CrawlOptions) {
  const crawlObservable = crawlStream<T>(options);

  crawlObservable.subscribe({
    next: (data) => {
      console.log('Crawled data:', data);
      // Xử lý từng phần dữ liệu khi nhận được
    },
    error: (error) => {
      console.error('Crawl error:', error);
    },
    complete: () => {
      console.log('Crawling completed');
    },
  });

  return crawlObservable;
}
