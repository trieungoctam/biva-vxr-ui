import { FormEvent, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import type { ChatStatus } from "../hooks/useChatStream";
import MessageBubble from "./MessageBubble";

interface ChatPanelProps {
    messages: ChatMessage[];
    status: ChatStatus;
    onSend: (message: string) => Promise<void>;
    onCancel: () => void;
    canCancel: boolean;
    lastError: string | null;
}

const quickReplies = [
    "Xin chào!",
    "Giới thiệu sản phẩm nổi bật?",
    "Tư vấn giúp tôi",
    "Kết thúc cuộc gọi.",
];

export default function ChatPanel({
    messages,
    status,
    onSend,
    onCancel,
    canCancel,
    lastError,
}: ChatPanelProps) {
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    const isStreaming = status === "streaming";
    const canChat = status === "ready" || status === "streaming";
    const sortedMessages = useMemo(
        () => [...messages].sort((a, b) => a.timestamp - b.timestamp),
        [messages],
    );

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        try {
            await onSend(trimmed);
            setInput("");
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            // noop - error message displayed via lastError
            console.error(error);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
    };

    return (
        <section className="chat-panel glass-card">
            <header className="panel-title">
                <span>Chat Arena</span>
                {isStreaming && <span className="badge badge-stream">STREAMING</span>}
            </header>

            <div className="chat-log">
                {sortedMessages.map((msg, idx) => (
                    <MessageBubble key={msg.id} message={msg} turn={idx} />
                ))}
                <div ref={endRef} />
            </div>

            {lastError && (
                <div className="alert alert-error">
                    <strong>⚠ Mission Alert:</strong> {lastError}
                </div>
            )}

            {canChat && (
                <div className="quick-replies">
                    {quickReplies.map((text) => (
                        <button
                            key={text}
                            className="chip"
                            type="button"
                            onClick={() => setInput(text)}
                        >
                            {text}
                        </button>
                    ))}
                </div>
            )}

            {canChat && !isStreaming && (
                <form className="chat-input" onSubmit={handleSubmit}>
                    <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            !canChat
                                ? status === "initializing"
                                  ? "Đang khởi tạo cuộc trò chuyện..."
                                  : "Khởi động nhiệm vụ trước..."
                                : "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
                        }
                        disabled={status !== "ready" && status !== "streaming"}
                    />
                    <div className="chat-actions">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onCancel}
                            disabled={!canCancel}
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!canChat || isStreaming}
                        >
                            Send
                        </button>
                    </div>
                </form>
            )}

            {isStreaming && (
                <div className="streaming-indicator">
                    <button type="button" className="btn btn-ghost" onClick={onCancel}>
                        ⏹ Dừng phản hồi
                    </button>
                </div>
            )}

            {!canChat && (
                <div className="chat-disabled-notice">
                    <div className="notice-content">
                        <span className="notice-icon">🚀</span>
                        <span className="notice-text">
                            {status === "idle"
                                ? "Vui lòng khởi động nhiệm vụ để bắt đầu trò chuyện"
                                : status === "initializing"
                                  ? "Đang khởi tạo cuộc trò chuyện, vui lòng đợi..."
                                  : status === "error"
                                    ? "Có lỗi xảy ra, vui lòng thử lại"
                                    : "Vui lòng khởi động nhiệm vụ để bắt đầu trò chuyện"}
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}
