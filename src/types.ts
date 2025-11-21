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

// Webhook types for auto booking
export type BookingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WebhookMessage {
  role: string;
  content: string;
}

export interface WebhookConversationData {
  conversation_id: string;
  customer_phone: string;
  callcenter_phone?: string;
  call_at?: string;
  pickup_at?: string;
  hangup_at?: string;
  hangup_cause?: string;
  sip_code_q850?: number;
  audio_url?: string;
  transfer_result?: string;
  messages?: WebhookMessage[];
}

export interface WebhookCallSummary {
  summary?: string;
}

export interface WebhookExtraData {
  call_summary?: WebhookCallSummary;
}

export interface WebhookPayload {
  conversation: WebhookConversationData;
  extra?: WebhookExtraData;
}

export interface WebhookResponse {
  [key: string]: unknown;
}
