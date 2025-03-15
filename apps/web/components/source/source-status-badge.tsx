import { Badge } from '@nova/ui/components/ui/badge';

export default function SourceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CREATED':
      return <Badge variant="gray">Created</Badge>;
    case 'PROCESSING':
      return <Badge variant="blue">Processing</Badge>;
    case 'PROCESSED':
      return <Badge variant="yellow">Processed</Badge>;
    case 'SYNCING':
      return <Badge variant="purple">Syncing</Badge>;
    case 'SYNCED':
      return <Badge variant="green">Synced</Badge>;
    case 'ERROR':
      return <Badge variant="red">Error</Badge>;
    default:
      return <Badge variant="gray">Unknown</Badge>;
  }
}
