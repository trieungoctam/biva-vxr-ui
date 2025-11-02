import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  turn: number;
}

export default function MessageBubble({ message, turn }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const classes = [
    'message-bubble',
    isUser ? 'user' : 'bot',
    message.streaming ? 'streaming' : '',
    message.error ? 'error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      <header>
        <span className="tag">{isUser ? 'Pilot' : 'Biva AI Core'}</span>
        <span className="turn">Turn #{turn + 1}</span>
      </header>
      <p>{message.content || (message.streaming ? '…' : '')}</p>
    </article>
  );
}
