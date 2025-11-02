export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  streaming?: boolean;
  error?: boolean;
}

export interface BotSetting {
  text_normalization: Record<string, unknown>;
  model_name: string;
  tts_service: string;
  voice_id: string;
  report_config: string;
  asr_url?: string | null;
}

export interface ConversationInitResponse {
  start_message: string;
  bot_setting: BotSetting;
  input_slots: Record<string, unknown>;
}

export interface ConversationInitConfig {
  conversationId?: string;
  botId?: string;
  customerPhone?: string;
  callcenterPhone?: string;
}

export interface ChatFormConfig extends ConversationInitConfig {
  requestFrom: string;
  requestId?: string;
  indexOverride?: number;
  inputSlots: Record<string, string>;
}
