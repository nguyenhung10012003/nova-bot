import { Page } from 'puppeteer';

export function normalizeUrl(url: string): string {
  try {
    const normalized = new URL(url);
    normalized.hash = ''; // Loại bỏ fragment (#...)
    return normalized.href.replace(/\/$/, ''); // Loại bỏ dấu "/" cuối nếu có
  } catch {
    return url.replace(/\/$/, '').split('#')[0]; // Fallback nếu URL không hợp lệ
  }
}

export function isUrlInCollection(
  urls: string[] | Set<string>,
  targetUrl: string,
): boolean {
  const normalizedTarget = normalizeUrl(targetUrl);

  if (Array.isArray(urls)) {
    return urls.some((url) => normalizeUrl(url) === normalizedTarget);
  }

  for (const url of urls) {
    if (normalizeUrl(url) === normalizedTarget) {
      return true;
    }
  }

  return false;
}

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
    ({ xpath, timeout }) => {
      const elements = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      return elements.iterateNext() !== null;
    },
    {},
    { xpath, timeout },
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
        let result = elements.iterateNext();
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

export /**
 * Kiểm tra xem một URL có phải là URL của file hay không (không tính .html)
 * @param url - Đường dẫn URL cần kiểm tra
 * @returns Boolean cho biết URL có phải URL của file hay không
 */
function isFileUrl(url: string): boolean {
  try {
    // Kiểm tra URL có hợp lệ không
    const parsedUrl = new URL(url);

    // Lấy phần path của URL
    const path = parsedUrl.pathname;

    // Kiểm tra xem path có phần mở rộng file hợp lệ không (trừ .html)
    const fileExtensionRegex =
      /\.(pdf|jpg|jpeg|png|gif|docx?|xlsx?|txt|csv|mp3|mp4|zip|rar|doc|xls|pptx|ppt)$/i;
    return fileExtensionRegex.test(path);
  } catch (error) {
    // Nếu URL không hợp lệ, trả về false
    return false;
  }
}

/**
 * Lấy phần mở rộng của file từ một URL hoặc đường dẫn file
 * @param path - Đường dẫn file hoặc URL
 * @returns Phần mở rộng file (không có dấu chấm) hoặc chuỗi rỗng nếu không có extension
 */
export function getFileExtension(path: string): string {
  try {
    // Loại bỏ các query params và fragment
    const cleanPath = path.split('?')[0].split('#')[0];

    // Lấy tên file từ path
    const fileName = cleanPath.split('/').pop() || '';

    // Regex kiểm tra phần mở rộng file
    const fileExtensionRegex =
      /\.(pdf|jpg|jpeg|png|gif|docx?|xlsx?|txt|csv|mp3|mp4|zip|rar|doc|xls|pptx|ppt|ics|sql|dat|log)$/i;

    // Nếu không match với regex, trả về chuỗi rỗng
    if (!fileExtensionRegex.test(fileName.toLowerCase())) return '';

    // Lấy phần mở rộng (không bao gồm dấu chấm)
    return fileName.split('.').pop()?.toLowerCase() || '';
  } catch (error) {
    return '';
  }
}
