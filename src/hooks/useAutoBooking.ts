import { useState, useCallback } from 'react';
import { triggerAutoBooking } from '../services/webhookService';
import type { BookingStatus, ChatMessage, WebhookResponse } from '../types';

interface UseAutoBookingReturn {
    bookingStatus: BookingStatus;
    bookingResponse: WebhookResponse | null;
    bookingError: string | null;
    triggerBooking: (
        conversationId: string,
        customerPhone: string,
        messages: ChatMessage[],
        callcenterPhone?: string,
        dryRun?: boolean
    ) => Promise<void>;
    resetBooking: () => void;
}

export function useAutoBooking(): UseAutoBookingReturn {
    const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle');
    const [bookingResponse, setBookingResponse] = useState<WebhookResponse | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const triggerBooking = useCallback(
        async (
            conversationId: string,
            customerPhone: string,
            messages: ChatMessage[],
            callcenterPhone?: string,
            dryRun?: boolean
        ) => {
            setBookingStatus('loading');
            setBookingError(null);
            setBookingResponse(null);

            try {
                const response = await triggerAutoBooking(conversationId, customerPhone, messages, callcenterPhone, dryRun);
                setBookingResponse(response);
                setBookingStatus('success');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                setBookingError(errorMessage);
                setBookingStatus('error');
                // Store error as response for display
                setBookingResponse({ error: errorMessage });
            }
        },
        []
    );

    const resetBooking = useCallback(() => {
        setBookingStatus('idle');
        setBookingResponse(null);
        setBookingError(null);
    }, []);

    return {
        bookingStatus,
        bookingResponse,
        bookingError,
        triggerBooking,
        resetBooking,
    };
}
