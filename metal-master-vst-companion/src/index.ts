import { WebSocketServer, WebSocket } from "ws";
import midi from "midi";
import { config } from "./config";

type IncomingMessage = {
  type: "noteOn" | "noteOff" | "allNotesOff" | "controlChange";
  channel?: number;
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
};

const DEFAULT_CHANNEL = 0;

function clampByte(v: number | undefined, fallback = 0): number {
  if (v === undefined || Number.isNaN(v)) return fallback;
  return Math.max(0, Math.min(127, Math.round(v)));
}

function resolveChannel(ch?: number): number {
  const c = ch ?? DEFAULT_CHANNEL;
  return Math.max(0, Math.min(15, Math.floor(c)));
}

class MidiOutput {
  private output = new midi.Output();
  private portIndex: number | null = null;

  constructor(private match: string) {}

  open(): void {
    const count = this.output.getPortCount();
    for (let i = 0; i < count; i += 1) {
      const name = this.output.getPortName(i);
      if (name && name.toLowerCase().includes(this.match.toLowerCase())) {
        this.output.openPort(i);
        this.portIndex = i;
        console.log(`[MIDI] Connected to output: ${name}`);
        return;
      }
    }
    throw new Error(`[MIDI] No output port found containing "${this.match}".`);
  }

  send(data: number[]): void {
    if (this.portIndex === null) {
      throw new Error("[MIDI] Output not opened.");
    }
    this.output.sendMessage(data);
  }

  close(): void {
    try {
      this.output.closePort();
    } catch (err) {
      // ignore close errors
    }
  }
}

const midiOut = new MidiOutput(config.midiOutputName);

function handleMessage(msg: IncomingMessage): void {
  switch (msg.type) {
    case "noteOn": {
      if (msg.note === undefined) return;
      const ch = resolveChannel(msg.channel);
      const note = clampByte(msg.note);
      const vel = clampByte(msg.velocity, 100);
      midiOut.send([0x90 | ch, note, vel]);
      break;
    }
    case "noteOff": {
      if (msg.note === undefined) return;
      const ch = resolveChannel(msg.channel);
      const note = clampByte(msg.note);
      const vel = clampByte(msg.velocity, 0);
      midiOut.send([0x80 | ch, note, vel]);
      break;
    }
    case "controlChange": {
      if (msg.controller === undefined || msg.value === undefined) return;
      const ch = resolveChannel(msg.channel);
      const ctrl = clampByte(msg.controller);
      const val = clampByte(msg.value);
      midiOut.send([0xB0 | ch, ctrl, val]);
      break;
    }
    case "allNotesOff": {
      const ch = resolveChannel(msg.channel);
      midiOut.send([0xB0 | ch, 123, 0]);
      break;
    }
    default:
      console.warn("[WS] Unknown message type:", (msg as any).type);
  }
}

function startServer() {
  midiOut.open();

  const wss = new WebSocketServer({
    host: config.wsHost,
    port: config.wsPort
  });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log(`[WS] Client connected from ${req.socket.remoteAddress || "unknown"}`);

    ws.on("message", (data) => {
      try {
        const parsed = JSON.parse(data.toString()) as IncomingMessage | IncomingMessage[];
        if (Array.isArray(parsed)) {
          parsed.forEach(handleMessage);
        } else {
          handleMessage(parsed);
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    });

    ws.on("close", () => {
      console.log("[WS] Client disconnected");
    });
  });

  wss.on("listening", () => {
    console.log(`[WS] Listening on ws://${config.wsHost}:${config.wsPort}`);
  });

  const shutdown = () => {
    console.log("Shutting down...");
    wss.close();
    midiOut.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer();
