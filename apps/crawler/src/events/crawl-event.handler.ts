import { IMessageHandler } from "@nova/lib";
import { crawl, CrawlOptions } from "../core";

export const crawlEventHandler: IMessageHandler<CrawlOptions> = async (message) => {
  const options: CrawlOptions = message.data;
  await crawl(options);
};