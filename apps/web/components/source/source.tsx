import { Button } from '@nova/ui/components/ui/button';
import { SquareArrowOutUpRight, Trash2 } from 'lucide-react';

type SourceProps = {
  name: string;
  onDelete: () => void;
  link?: string;
};
export function Source(source: SourceProps) {
  return (
    <div className="flex justify-between items-center rounded-lg group bg-primary/10 h-10 p-2 transition-all duration-200">
      <span className="text-foreground">{source.name}</span>
      <div className="flex gap-2">
        {source.link && (
          <Button
            className="group-hover:flex hidden p-1 h-auto "
            onClick={() => window.open(source.link, '_blank')}
          >
            <SquareArrowOutUpRight className="w-4 h-4" />
          </Button>
        )}
        <Button
          onClick={source.onDelete}
          variant={'destructive'}
          className="group-hover:flex hidden p-1 h-auto "
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
