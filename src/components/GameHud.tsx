import type { BotSetting } from '../types';
import type { ChatStatus } from '../hooks/useChatStream';

interface GameHudProps {
  status: ChatStatus;
  botSettings: BotSetting | null;
  conversationId?: string | null;
  turn: number;
}

const statusLabel: Record<ChatStatus, string> = {
  idle: 'IDLE',
  initializing: 'SYNCING...',
  ready: 'READY',
  streaming: 'STREAMING',
  error: 'ERROR',
};

export default function GameHud({ status, botSettings, conversationId, turn }: GameHudProps) {
  return (
    <header className="game-hud">
      <div className="hud-block">
        <span className="label">STATUS</span>
        <span className={`value status-${status}`}>{statusLabel[status]}</span>
      </div>
      <div className="hud-block">
        <span className="label">MODEL</span>
        <span className="value">{botSettings?.model_name ?? '—'}</span>
      </div>
      <div className="hud-block">
        <span className="label">VOICE</span>
        <span className="value">{botSettings?.voice_id ?? '—'}</span>
      </div>
      <div className="hud-block">
        <span className="label">CONV ID</span>
        <span className="value">{conversationId ?? '—'}</span>
      </div>
      <div className="hud-block">
        <span className="label">TURN</span>
        <span className="value">{turn}</span>
      </div>
    </header>
  );
}
