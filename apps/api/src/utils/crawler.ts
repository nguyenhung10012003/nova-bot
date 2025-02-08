import { urlIsSitemap } from '@nova/utils';
import {
  Configuration,
  Cookie,
  downloadListOfUrls,
  PlaywrightCrawler,
} from 'crawlee';
import { Page } from 'playwright';

/**
 * Wait for an element to appear in the page
 * @param page - The Playwright page object
 * @param xpath - The XPath of the element to wait for
 * @param timeout - The timeout in milliseconds
 * @example
 * await waitForXPath(page, "//div[@class='content']", 5000);
 */
export async function waitForXPath(page: Page, xpath: string, timeout: number) {
  await page.waitForFunction(
    (xpath) => {
      const elements = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      return elements.iterateNext() !== null;
    },
    xpath,
    { timeout },
  );
}

const defaultSelector = 'body';
const defaultIgnoreSelector = `script, style, nav, .hidden, .hide, [class*="menu"], .navbar, .nav, .sidebar, .aside, .modal, [class*="sidebar"]`;

/**
 * Get the inner text of an element by CSS selector or XPath
 * @param page - The Playwright page object
 * @param selector - The CSS selector or XPath
 * @param ignoreSelector - The CSS selector to ignore
 * @returns - The inner text of the element
 * @example
 * const content = await getPageHtml(page, "body", ".ignore");
 * console.log(content);
 * @example
 * const content = await getPageHtml(page, "//div[@class='content']", ".ignore");
 * console.log(content);
 */
export function getPageHtml(
  page: Page,
  selector = defaultSelector,
  ignoreSelector = defaultIgnoreSelector,
) {
  return page.evaluate(
    ({ selector, ignoreSelector }) => {
      // Check if the selector is an XPath
      if (selector.startsWith('/')) {
        const elements = document.evaluate(
          selector,
          document,
          null,
          XPathResult.ANY_TYPE,
          null,
        );
        const result = elements.iterateNext();
        if (result && result instanceof HTMLElement && ignoreSelector) {
          const ignoredElements = result.querySelectorAll(ignoreSelector);
          ignoredElements.forEach((el) => el.remove());
          return result.textContent || '';
        }
        return '';
      } else {
        // Handle as a CSS selector
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el && ignoreSelector) {
          const ignoredElements = el.querySelectorAll(ignoreSelector);
          ignoredElements.forEach((el) => el.remove());
          return el.innerText || '';
        }
        return '';
      }
    },
    { selector, ignoreSelector },
  );
}

export function getFileUrls(
  page: Page,
  extensionMatch: string,
  baseUrl: string,
) {
  return page.evaluate(
    ({ extensionMatch, baseUrl }) => {
      const elements = document.querySelectorAll('a[href]');
      const regex = new RegExp(extensionMatch);
      const filteredElements = Array.from(elements).filter((el) =>
        regex.test(el.getAttribute('href') || ''),
      );
      const urls: string[] = [];
      filteredElements.forEach((el) => {
        const url = el.getAttribute('href');
        if (url) {
          urls.push(new URL(url, baseUrl).href);
        }
      });
      return urls;
    },
    { extensionMatch, baseUrl },
  );
}

export type CrawlOptions = {
  urls: string[];
  selector?: string;
  ignoreSelector?: string;
  waitForSelectorTimeout?: number;
  match: string | string[];
  exclude?: string | string[];
  maxRequestsPerCrawl?: number;
  resourceExclusions?: string[];
  cookie?: Cookie | Cookie[];
  fileOptions?: {
    extensionMatch: string;
  };
};

const configuaraion = new Configuration({
  persistStorage: false,
});
export async function crawl(options: CrawlOptions) {
  const crawler = new PlaywrightCrawler(
    {
      // function to handle requests and enqueue new URLs
      async requestHandler({ request, page, pushData, enqueueLinks }) {
        const title = await page.title();

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

        const html = await getPageHtml(
          page,
          options.selector,
          options.ignoreSelector,
        );

        const fileUrls = options.fileOptions
          ? await getFileUrls(
              page,
              options.fileOptions.extensionMatch,
              request.url,
            )
          : [];

        await pushData({ title, url: request.loadedUrl, html, fileUrls });

        await enqueueLinks({
          globs:
            typeof options.match === 'string' ? [options.match] : options.match,
          exclude:
            typeof options.exclude === 'string'
              ? [options.exclude]
              : (options.exclude ?? []),
        });
      },
      // maximum number of requests to make
      maxRequestsPerCrawl: options.maxRequestsPerCrawl,
      preNavigationHooks: [
        // Abort requests for certain resource types
        async ({ request, page }) => {
          // If there are no resource exclusions, return
          const RESOURCE_EXCLUSTIONS = options.resourceExclusions ?? [];
          if (RESOURCE_EXCLUSTIONS.length === 0) {
            return;
          }
          if (options.cookie) {
            const cookies = (
              Array.isArray(options.cookie) ? options.cookie : [options.cookie]
            ).map((cookie) => {
              return {
                name: cookie.name,
                value: cookie.value,
                url: request.loadedUrl,
              };
            });
            await page.context().addCookies(cookies);
          }
          await page.route(`**\/*.{${RESOURCE_EXCLUSTIONS.join()}}`, (route) =>
            route.abort('aborted'),
          );
        },
      ],
    },
    configuaraion,
  );

  // Get the list of URLs to crawl
  const urlsToCrawl = [];
  for (const url of options.urls) {
    // Check if the URL is a sitemap and download the list of URLs
    if (urlIsSitemap(url)) {
      const sitemapUrls = await downloadListOfUrls({ url });
      urlsToCrawl.push(...sitemapUrls);
    } else {
      urlsToCrawl.push(url);
    }
  }

  await crawler.run(urlsToCrawl);
  return crawler.getData();
}

export type GetUrlsOptions = {
  urls: string[];
  match: string | string[];
  exclude?: string | string[];
  maxRequestsPerCrawl?: number;
  fileOptions?: {
    extensionMatch: string;
  };
};
export async function getUrls(options: GetUrlsOptions) {
  const crawler = new PlaywrightCrawler({
    requestHandler: async ({ request, enqueueLinks, pushData, page }) => {
      const fileUrls = options.fileOptions
        ? await getFileUrls(
            page,
            options.fileOptions.extensionMatch,
            request.url,
          )
        : [];
      await pushData({ url: request.url, fileUrls });
      await enqueueLinks({
        globs:
          typeof options.match === 'string' ? [options.match] : options.match,
        exclude:
          typeof options.exclude === 'string'
            ? [options.exclude]
            : (options.exclude ?? []),
      });
    },
  });

  // Get the list of URLs to crawl
  const urlsToCrawl = [];
  for (const url of options.urls) {
    // Check if the URL is a sitemap and download the list of URLs
    if (urlIsSitemap(url)) {
      const sitemapUrls = await downloadListOfUrls({ url });
      urlsToCrawl.push(...sitemapUrls);
    } else {
      urlsToCrawl.push(url);
    }
  }

  await crawler.run(urlsToCrawl);
  return crawler.getData();
}
