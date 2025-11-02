import { useCallback, useRef, useState } from 'react';
import type {
  BotSetting,
  ChatFormConfig,
  ChatMessage,
  ConversationInitConfig,
  ConversationInitResponse,
} from '../types';
import { getApiConfig } from '../config/api';

export type ChatStatus = 'idle' | 'initializing' | 'ready' | 'streaming' | 'error';

const API_BASE = (() => {
  const config = getApiConfig();
  try {
    new URL(config.baseUrl);
    return config.baseUrl;
  } catch {
    console.warn('Invalid VITE_API_BASE_URL, falling back to localhost:17498');
    return 'http://localhost:17498';
  }
})();

const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const parseInputSlots = (slots: Record<string, string>) => {
  const parsed: Record<string, unknown> = {};
  Object.entries(slots).forEach(([key, value]) => {
    if (!value.trim()) return;
    try {
      parsed[key] = JSON.parse(value);
    } catch (error) {
      parsed[key] = value;
    }
  });
  return parsed;
};

type MessageUpdater = Partial<ChatMessage> | ((current: ChatMessage) => ChatMessage);

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [botSettings, setBotSettings] = useState<BotSetting | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);

  const conversationIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateAssistantMessage = useCallback((id: string, patch: MessageUpdater) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== id) return msg;
        if (typeof patch === 'function') {
          return patch(msg);
        }
        return { ...msg, ...patch };
      })
    );
  }, []);

  const initConversation = useCallback(async (payload: ConversationInitConfig) => {
    abortRef.current?.abort();
    setStatus('initializing');
    setLastError(null);
    setTurn(0);

    const conversationId = payload.conversationId?.trim() || uuid();
    conversationIdRef.current = conversationId;

    const body = {
      conversation_id: conversationId,
      bot_id: payload.botId || undefined,
      customer_phone: payload.customerPhone || undefined,
      callcenter_phone: payload.callcenterPhone || undefined,
    };

    const response = await fetch(`${API_BASE}/api/conversation/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      setStatus('error');
      setLastError(`Init failed (${response.status}): ${text}`);
      throw new Error(text);
    }

    const data: ConversationInitResponse = await response.json();
    setBotSettings(data.bot_setting);

    const openingMessage: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: data.start_message,
      timestamp: Date.now(),
    };

    setMessages([openingMessage]);
    setStatus('ready');
    return conversationId;
  }, []);

  const sendMessage = useCallback(
    async (text: string, config: ChatFormConfig) => {
      if (!conversationIdRef.current) {
        throw new Error('Conversation not initialized yet.');
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatMessage = {
        id: uuid(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      const assistantId = uuid();
      const assistantShell: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantShell]);
      setStatus('streaming');
      setLastError(null);

      const history = [...messages, userMessage]
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const index = typeof config.indexOverride === 'number' ? config.indexOverride : turn;

      const body = {
        conversation_id: conversationIdRef.current,
        message: text,
        messages: history,
        request_from: config.requestFrom,
        index,
        customer_phone: config.customerPhone || undefined,
        callcenter_phone: config.callcenterPhone || undefined,
        request_id: config.requestId || uuid(),
        input_slots: parseInputSlots(config.inputSlots),
      };

      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        setStatus('error');
        setLastError(`Stream failed (${response.status}): ${errorText}`);
        updateAssistantMessage(assistantId, { streaming: false, error: true, content: errorText });
        throw new Error(errorText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let streamComplete = false;

      const finishStream = () => {
        updateAssistantMessage(assistantId, { streaming: false });
        setStatus('ready');
        setTurn((prev) => prev + 1);
        streamComplete = true;
      };

      const handlePayload = (payload: string) => {
        if (payload === '[DONE]') {
          finishStream();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          if (parsed?.content) {
            updateAssistantMessage(assistantId, (current) => ({
              ...current,
              content: `${current.content ?? ''}${parsed.content}`,
            }));
          }
        } catch (error) {
          updateAssistantMessage(assistantId, (current) => ({
            ...current,
            content: `${current.content ?? ''}${payload}`,
          }));
        }
      };

      const flushBuffer = (input: string, finalChunk = false) => {
        const segments = input.split('\n\n');
        const remainder = finalChunk ? '' : segments.pop() ?? '';

        for (const segment of segments) {
          const lines = segment.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.replace(/^data:\s*/, '').trim();
            if (!payload) continue;
            handlePayload(payload);
            if (streamComplete) {
              return remainder;
            }
          }
        }

        return remainder;
      };

      try {
        while (!streamComplete) {
          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode(new Uint8Array(), { stream: false });
            buffer = flushBuffer(buffer, true);
            if (!streamComplete) {
              finishStream();
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          buffer = flushBuffer(buffer);
        }
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') {
          updateAssistantMessage(assistantId, { streaming: false });
          setStatus('ready');
          return;
        }

        // Enhanced error categorization
        let errorMessage = 'Unknown error occurred';
        if (error instanceof TypeError && error.message.includes('fetch')) {
          errorMessage = 'Network error - please check your connection';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        updateAssistantMessage(assistantId, { streaming: false, error: true, content: errorMessage });
        setStatus('error');
        setLastError(errorMessage);
      }
    },
    [messages, turn, updateAssistantMessage]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus((prev) => (prev === 'streaming' ? 'ready' : prev));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    conversationIdRef.current = null;
    setMessages([]);
    setBotSettings(null);
    setStatus('idle');
    setLastError(null);
    setTurn(0);
  }, []);

  return {
    messages,
    status,
    botSettings,
    lastError,
    conversationId: conversationIdRef.current,
    turn,
    initConversation,
    sendMessage,
    cancel,
    reset,
  };
}
