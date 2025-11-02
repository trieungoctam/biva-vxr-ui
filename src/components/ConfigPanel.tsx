import type { ChangeEvent } from "react";
import type { ChatFormConfig } from "../types";
import type { ChatStatus } from "../hooks/useChatStream";

interface ConfigPanelProps {
    config: ChatFormConfig;
    onChange: (config: ChatFormConfig) => void;
    status: ChatStatus;
    onInit: () => void;
    onReset: () => void;
    conversationId?: string | null;
}

const valueOrEmpty = (value?: string) => value ?? "";

export default function ConfigPanel({
    config,
    onChange,
    status,
    onInit,
    onReset,
    conversationId,
}: ConfigPanelProps) {
    const handleField =
        (key: keyof ChatFormConfig) =>
        (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            onChange({ ...config, [key]: event.target.value });
        };

    const handleSlotValueChange =
        (slotKey: string) => (event: ChangeEvent<HTMLInputElement>) => {
            onChange({
                ...config,
                inputSlots: { ...config.inputSlots, [slotKey]: event.target.value },
            });
        };

    const handleSlotKeyChange =
        (oldKey: string) => (event: ChangeEvent<HTMLInputElement>) => {
            const newKey = event.target.value.trim();
            if (!newKey || newKey === oldKey) {
                return;
            }
            if (config.inputSlots[newKey]) {
                return;
            }
            const { [oldKey]: oldValue, ...rest } = config.inputSlots;
            onChange({
                ...config,
                inputSlots: {
                    ...rest,
                    [newKey]: oldValue,
                },
            });
        };

    const addSlot = () => {
        const slotIndex = Object.keys(config.inputSlots).length + 1;
        let slotKey = `slot_${slotIndex}`;
        while (config.inputSlots[slotKey]) {
            slotKey = `${slotKey}_x`;
        }
        onChange({
            ...config,
            inputSlots: {
                ...config.inputSlots,
                [slotKey]: "",
            },
        });
    };

    const removeSlot = (slotKey: string) => {
        const nextSlots = { ...config.inputSlots };
        delete nextSlots[slotKey];
        onChange({ ...config, inputSlots: nextSlots });
    };

    return (
        <aside className="config-panel glass-card">
            <header className="panel-title">
                <span>Mission Loadout</span>
                {conversationId && <span className="badge">ID: {conversationId}</span>}
            </header>

            <div className="config-group">
                <label>
                    Bot ID
                    <input
                        type="text"
                        value={valueOrEmpty(config.botId)}
                        onChange={handleField("botId")}
                        placeholder="UUID bot (optional)"
                    />
                </label>
            </div>

            <div className="config-group">
                <label>
                    Customer Phone
                    <input
                        type="tel"
                        value={valueOrEmpty(config.customerPhone)}
                        onChange={handleField("customerPhone")}
                        placeholder="+84..."
                    />
                </label>
                <label>
                    Callcenter Phone
                    <input
                        type="tel"
                        value={valueOrEmpty(config.callcenterPhone)}
                        onChange={handleField("callcenterPhone")}
                        placeholder="1900..."
                    />
                </label>
            </div>

            <div className="config-group">
                <label>
                    Request From
                    <select
                        value={config.requestFrom}
                        onChange={handleField("requestFrom")}
                    >
                        <option value="web_chat">web_chat</option>
                        <option value="live_demo">live_demo</option>
                        <option value="call_center">call_center</option>
                    </select>
                </label>
                <label>
                    Request ID
                    <input
                        type="text"
                        value={valueOrEmpty(config.requestId)}
                        onChange={handleField("requestId")}
                        placeholder="Auto nếu bỏ trống"
                    />
                </label>
                <label>
                    Index Override
                    <input
                        type="number"
                        value={config.indexOverride ?? ""}
                        onChange={(event) =>
                            onChange({
                                ...config,
                                indexOverride: event.target.value
                                    ? Number(event.target.value)
                                    : undefined,
                            })
                        }
                        placeholder="Auto increment"
                    />
                </label>
            </div>

            <div className="config-group">
                <header className="group-title">Input Slots</header>
                {Object.entries(config.inputSlots).map(([key, value]) => (
                    <div className="slot-row" key={key}>
                        <input
                            className="slot-key"
                            type="text"
                            value={key}
                            onChange={handleSlotKeyChange(key)}
                        />
                        <input
                            className="slot-value"
                            type="text"
                            value={value}
                            onChange={handleSlotValueChange(key)}
                            placeholder='Ví dụ: {"tier": "vip"}'
                        />
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => removeSlot(key)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addSlot}>
                    + Add Slot
                </button>
            </div>

            <footer className="config-actions">
                <button type="button" className="btn btn-ghost" onClick={onReset}>
                    Reset Loadout
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onInit}
                    disabled={status === "initializing"}
                >
                    {status === "initializing" ? "Launching..." : "Launch Mission"}
                </button>
            </footer>
        </aside>
    );
}
