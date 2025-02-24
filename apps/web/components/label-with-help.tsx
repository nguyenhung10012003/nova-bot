import { Label } from '@nova/ui/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nova/ui/components/ui/tooltip';
import { CircleHelp } from 'lucide-react';
import React, { LabelHTMLAttributes } from 'react';

interface LabelWithHelpProps extends LabelHTMLAttributes<HTMLLabelElement> {
  explain?: React.ReactNode;
  label: React.ReactNode;
}

export function LabelWithHelp({
  explain,
  label,
  ...props
}: LabelWithHelpProps) {
  return (
    <div className="flex gap-2 items-center">
      <Label {...props}>{label}</Label>
      <Tooltip>
        <TooltipTrigger>
          <CircleHelp className="h-5 w-5 hover:cursor-pointer text-primary hover:text-primary/80" />
        </TooltipTrigger>
        <TooltipContent>{explain}</TooltipContent>
      </Tooltip>
    </div>
  );
}
