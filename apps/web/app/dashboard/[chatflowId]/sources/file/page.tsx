'use client';
import { FileUpload } from '@/components/file-upload';
import { Source } from '@/components/source';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@nova/ui/components/ui/accordion';

const acceptFileTypes = `
    text/csv,
    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
    application/pdf,
    application/json,
    application/vnd.openxmlformats-officedocument.presentationml.presentation,
    text/plain,
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  `;

export default function Page() {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-foreground">File sources</h1>
      <div className="flex flex-col md:flex-row mt-8 gap-4">
        <div className="flex basis-2/3 shrink-0 w-full flex-col">
          <FileUpload className="w-full" accept={acceptFileTypes} />
          <Accordion type="multiple" className="w-full">
            <AccordionItem value={'selected-files'}>
              <AccordionTrigger className="w-full text-lg font-semibold text-foreground">
                Selected files
              </AccordionTrigger>
              <AccordionContent>
                <Source name="File 1" onDelete={() => {}} link="fds"></Source>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value={'included-files'}>
              <AccordionTrigger className="w-full text-lg font-semibold text-foreground">
                Already included files
              </AccordionTrigger>
              <AccordionContent>
                <Source name="File 1" onDelete={() => {}} link="fds"></Source>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="basis-1/3 shrink-0 w-full">ád</div>
      </div>
    </div>
  );
}
