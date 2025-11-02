import { useState } from 'react';
import ChatPanel from './components/ChatPanel';
import ConfigPanel from './components/ConfigPanel';
import GameHud from './components/GameHud';
import { useChatStream } from './hooks/useChatStream';
import type { ChatFormConfig } from './types';

const createDefaultConfig = (): ChatFormConfig => ({
  requestFrom: 'web_chat',
  inputSlots: {},
});

export default function App() {
  const [config, setConfig] = useState<ChatFormConfig>(() => createDefaultConfig());
  const { messages, status, botSettings, lastError, conversationId, turn, initConversation, sendMessage, cancel, reset } =
    useChatStream();

  const handleInit = async () => {
    try {
      await initConversation(config);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (text: string) => {
    await sendMessage(text, config);
  };

  const handleReset = () => {
    reset();
    setConfig(createDefaultConfig());
  };

  return (
    <div className="game-shell">
      <GameHud status={status} botSettings={botSettings} conversationId={conversationId} turn={turn} />
      <main className="workspace">
        <ConfigPanel
          config={config}
          onChange={setConfig}
          status={status}
          onInit={handleInit}
          onReset={handleReset}
          conversationId={conversationId}
        />
        <ChatPanel
          messages={messages}
          status={status}
          onSend={handleSend}
          onCancel={cancel}
          canCancel={status === 'streaming'}
          lastError={lastError}
        />
      </main>
    </div>
  );
}
