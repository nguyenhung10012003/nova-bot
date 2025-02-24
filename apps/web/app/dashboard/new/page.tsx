import CreateChatflowForm from '@/components/chatflow-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nova/ui/components/ui/card';

export default function Page() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md shadow-md mt-16">
        <CardHeader>
          <CardTitle>Create Chatflow</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateChatflowForm />
        </CardContent>
      </Card>
    </div>
  );
}