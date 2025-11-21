import { resolveApiUrl } from '../config/api';
import type { WebhookPayload, WebhookResponse, ChatMessage } from '../types';

const API_BASE = resolveApiUrl();

/**
 * Trigger auto booking webhook
 * @param conversationId - Current conversation ID
 * @param customerPhone - Customer phone number
 * @param messages - Full conversation history
 * @param callcenterPhone - Optional callcenter phone
 * @returns Webhook response object
 */
export async function triggerAutoBooking(
    conversationId: string,
    customerPhone: string,
    messages: ChatMessage[],
    callcenterPhone?: string
): Promise<WebhookResponse> {
    // Build webhook payload according to API spec
    const payload: WebhookPayload = {
        conversation: {
            conversation_id: conversationId,
            customer_phone: customerPhone,
            callcenter_phone: callcenterPhone,
            hangup_at: Date.now().toString(),
            hangup_cause: 'NORMAL_CLEARING',
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        },
    };

    const response = await fetch(`${API_BASE}/webhook/callbot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook failed (${response.status}): ${errorText}`);
    }

    const data: WebhookResponse = await response.json();
    return data;
}
