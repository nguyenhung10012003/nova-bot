import { Button } from '@repo/ui/components/ui/button';

const RootPage = ({ params }: { params: { forTest?: boolean } }) => {
  return (
    <main className="p-4">
      <Button>Press</Button>
    </main>
  );
};

export default RootPage;
