'use client';
import { Chatflow } from '@/@types/chatflow';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nova/ui/components/ui/tabs';
import Image from 'next/image';
import { CopyBlock, dracula } from 'react-code-blocks';

type EmbedProps = {
  chatflow: Chatflow;
};

export default function Embed({ chatflow }: EmbedProps) {
  const tabs = [
    {
      key: 'embed',
      label: 'Embed',
      icon: '/images/embed.svg',
    },
    {
      key: 'python',
      label: 'Python',
      icon: '/images/python.svg',
    },
    {
      key: 'javascript',
      label: 'Javascript',
      icon: '/images/javascript.svg',
    },
    {
      key: 'curl',
      label: 'Curl',
      icon: '/images/curl.svg',
    },
  ];
  return (
    <Tabs className="flex flex-col gap-4" defaultValue="embed">
      <TabsList className="w-full border-b overflow-x-auto overflow-y-hidden md:h-10 h-12">
        {tabs.map((tab) => (
          <TabsTrigger
            value={tab.key}
            key={tab.key}
            className="text-md max-w-[150px] hover:text-primary/70 flex items-center cursor-pointer gap-2"
          >
            <Image
              src={tab.icon}
              alt={tab.label}
              className="w-5 h-5 mr-2"
              width={250}
              height={250}
            />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="embed" className="flex flex-col gap-4 text-md">
        {chatflow.apiKey ? (
          'You cannot use API key while embedding/sharing chatbot.'
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-lg">Popup HTML</h2>
              <CopyBlock
                customStyle={{ fontSize: '14px', padding: '12px' }}
                text={`<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.init({
        chatflowid: "${chatflow.id}",
        apiHost: "${chatflow.baseUrl}",
    })
</script>`}
                language="html"
                showLineNumbers={false}
                theme={dracula}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-lg">Fullpage HTML</h2>
              <CopyBlock
                customStyle={{ fontSize: '14px', padding: '12px' }}
                text={`<flowise-fullchatbot></flowise-fullchatbot>
<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.initFull({
        chatflowid: "${chatflow.id}",
        apiHost: "${chatflow.baseUrl}",
    })
</script>`}
                language="html"
                showLineNumbers={false}
                theme={dracula}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-lg">Popup React</h2>
              <CopyBlock
                customStyle={{ fontSize: '14px', padding: '12px' }}
                text={`import { BubbleChat } from 'flowise-embed-react'

const App = () => {
    return (
        <BubbleChat
            chatflowid: "${chatflow.id}",
            apiHost: "${chatflow.baseUrl}",
        />
    );
};`}
                language="jsx"
                showLineNumbers={false}
                theme={dracula}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-lg">Fullpage React</h2>
              <CopyBlock
                customStyle={{ fontSize: '14px', padding: '12px' }}
                text={`import { FullPageChat } from 'flowise-embed-react'

const App = () => {
    return (
        <FullPageChat
            chatflowid: "${chatflow.id}",
            apiHost: "${chatflow.baseUrl}",
        />
    );
};`}
                language="jsx"
                showLineNumbers={false}
                theme={dracula}
              />
            </div>
          </>
        )}
      </TabsContent>
      <TabsContent className="text-md" value="python">
        <CopyBlock
          customStyle={{ fontSize: '14px', padding: '12px' }}
          text={`import requests

API_URL = "${chatflow.baseUrl}/api/v1/prediction/${chatflow.id}"
${chatflow.apiKey ? `headers = {"Authorization": "Bearer ${chatflow.apiKey}"}` : ''}
def query(payload):
    response = requests.post(API_URL, json=payload)
    return response.json()
    
output = query({
    "question": "Hey, how are you?",
})`}
          language="python"
          showLineNumbers={false}
          theme={dracula}
        />
      </TabsContent>

      <TabsContent className="text-md" value="javascript">
        <CopyBlock
          customStyle={{ fontSize: '14px', padding: '12px' }}
          text={`async function query(data) {
    const response = await fetch(
        "${chatflow.baseUrl}/api/v1/prediction/${chatflow.id}",
        {
            method: "POST",
            headers: {
                ${chatflow.apiKey ? `Authorization": "Bearer ${chatflow.apiKey}` : ''}
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({"question": "Hey, how are you?"}).then((response) => {
    console.log(response);
});`}
          language="javascript"
          showLineNumbers={false}
          theme={dracula}
        />
      </TabsContent>
      <TabsContent className="text-md" value="curl">
        <CopyBlock
          customStyle={{ fontSize: '14px', padding: '12px' }}
          text={`curl ${chatflow.baseUrl}/api/v1/prediction/${chatflow.id} \\
     -X POST \\
     -d '{"question": "Hey, how are you?"}' \\
     -H "Content-Type: application/json" ${
       chatflow.apiKey
         ? `\\
     -H "Authorization: Bearer ${chatflow.apiKey}"`
         : ''
     }`}
          language="bash"
          showLineNumbers={false}
          theme={dracula}
        />
      </TabsContent>
    </Tabs>
  );
}
