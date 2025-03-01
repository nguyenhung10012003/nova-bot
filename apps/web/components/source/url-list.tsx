'use client';
import revalidate from '@/api/action';
import { api } from '@/api/api';
import { Source } from '@/components/source/source';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@nova/ui/components/ui/accordion';
import { toast } from '@nova/ui/components/ui/sonner';
import { useParams } from 'next/navigation';
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

  const { sourceId } = useParams();

  const onDelete = async (url: string) => {
    const res = await api.patch(`/sources/${sourceId}`, {
      urls: urls.filter((u) => u.url !== url),
    });

    if (res.error) {
      toast.error('Failed to delete source');
    } else {
      revalidate(`source-${sourceId}`);
      toast.success('Source deleted successfully');
    }
  };
  return (
    <Accordion type="multiple" className="w-full" defaultValue={['selected-files', 'included-files']}>
      <AccordionItem value={'selected-files'}>
        <AccordionTrigger className="w-full text-lg font-semibold text-foreground">
          Web Urls
        </AccordionTrigger>
        <AccordionContent className="space-y-2">
          {webUrls.length ? (
            webUrls.map((url, index) => (
              <Source
                key={index}
                name={url.url}
                onDelete={() => onDelete(url.url)}
                link={url.url}
              />
            ))
          ) : (
            <div className="text-center">No web urls</div>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value={'included-files'}>
        <AccordionTrigger className="w-full text-lg font-semibold text-foreground">
          File Urls
        </AccordionTrigger>
        <AccordionContent className="space-y-2">
          {fileUrls.length ? (
            fileUrls.map((url, index) => (
              <Source
                key={index}
                name={url.url}
                onDelete={() => onDelete(url.url)}
                link={url.url}
              />
            ))
          ) : (
            <div className="text-center">No file urls</div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
