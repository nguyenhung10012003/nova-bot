import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import { crawlStream } from './crawler/crawler';

dotenv.config();

interface CrawlRequestQuery {
  urls?: string[];
  match?: string | string[];
  fileMatch?: string | string[];
  maxUrlsToCrawl?: number;
}

function parseQueryParams(req: http.IncomingMessage): CrawlRequestQuery {
  const parsedUrl = url.parse(req.url || '', true);
  const query = parsedUrl.query;

  // Parse URLs
  const urlsParam = query.urls;
  const urls = Array.isArray(urlsParam)
    ? urlsParam
    : urlsParam
      ? [urlsParam]
      : [];

  // Parse match patterns
  const matchParam = query.match;
  const match = Array.isArray(matchParam)
    ? matchParam
    : matchParam
      ? [matchParam]
      : [];

  // Parse file match patterns
  const fileMatchParam = query.fileMatch;
  const fileMatch = Array.isArray(fileMatchParam)
    ? fileMatchParam
    : fileMatchParam
      ? [fileMatchParam]
      : [];

  // Parse max URLs to crawl
  const maxUrlsToCrawl = query.maxUrlsToCrawl
    ? parseInt(query.maxUrlsToCrawl as string, 10)
    : 25;

  return {
    urls,
    match,
    fileMatch,
    maxUrlsToCrawl,
  };
}

function createCrawlStreamServer() {
  const server = http.createServer((req, res) => {
    // Chỉ chấp nhận endpoint /stream và phương thức GET
    if (req.method !== 'GET' || !req.url?.startsWith('/stream')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    try {
      // Parse query parameters
      const { urls, match, fileMatch, maxUrlsToCrawl } = parseQueryParams(req);

      // Validate required parameters
      if (!urls?.length || !match) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Missing required parameters: urls and match are required',
          }),
        );
        return;
      }

      // Cấu hình stream crawl
      const crawlOptions = {
        urls,
        match,
        maxUrlsToCrawl,
        ...(fileMatch?.length
          ? {
              file: {
                extensionMatch: fileMatch,
              },
            }
          : {}),
      };

      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-open',
      });

      // Tạo crawl stream
      const crawlStream$ = crawlStream(crawlOptions);

      // Subcribe và ghi dữ liệu
      const subscription = crawlStream$.subscribe({
        next: (data) => {
          // Gửi từng phần dữ liệu dưới dạng server-sent events
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        },
        error: (error) => {
          // Xử lý lỗi
          res.write(`event: error\ndata: ${JSON.stringify(error)}\n\n`);
          res.end();
          subscription.unsubscribe();
        },
        complete: () => {
          // Kết thúc stream
          res.write(`event: complete\ndata: ${JSON.stringify('Finished')}\n\n`);
          res.end();
          subscription.unsubscribe();
        },
      });

      // Xử lý khi client ngắt kết nối
      req.on('close', () => {
        subscription.unsubscribe();
      });
    } catch (error) {
      // Xử lý các lỗi không mong muốn
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  });

  return server;
}

// Khởi động server
const PORT = process.env.PORT || 4000;
const server = createCrawlStreamServer();
server.listen(PORT, () => {
  console.log(`Crawl Stream Server running on port ${PORT}`);
});

export default server;
