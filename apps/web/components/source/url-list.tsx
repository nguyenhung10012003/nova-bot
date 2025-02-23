'use client';
import { Source } from '@/components/source/source';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@nova/ui/components/ui/accordion';
import { useMemo } from 'react';

type UrlListProps = {
  urls: {
    url: string;
    type: 'URL' | 'FILE';
  }[];
};

export function UrlList({ urls }: UrlListProps) {
  const webUrls = useMemo(
    () => urls.filter((url) => url.type === 'URL'),
    [urls],
  );
  const fileUrls = useMemo(
    () => urls.filter((url) => url.type === 'FILE'),
    [urls],
  );
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value={'selected-files'}>
        <AccordionTrigger className="w-full text-lg font-semibold text-foreground">
          Web Urls
        </AccordionTrigger>
        <AccordionContent>
          {webUrls.length ? webUrls.map((url, index) => (
            <Source key={index} name={url.url} onDelete={() => {}} link={url.url} />
          )) : <div className="text-center">No web urls</div>}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value={'included-files'}>
        <AccordionTrigger className="w-full text-lg font-semibold text-foreground">
          File Urls
        </AccordionTrigger>
        <AccordionContent>
          {fileUrls.length ? fileUrls.map((url, index) => (
            <Source key={index} name={url.url} onDelete={() => {}} link={url.url} />
          )) : <div className="text-center">No file urls</div>}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
