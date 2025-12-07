import { z } from "zod";

const ConfigSchema = z.object({
  wsHost: z.string().default("127.0.0.1"),
  wsPort: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(47800),
  midiOutputName: z.string().min(1).default("MetalMasterVST")
});

const raw = {
  wsHost: process.env.WS_HOST,
  wsPort: process.env.WS_PORT ? Number(process.env.WS_PORT) : undefined,
  midiOutputName: process.env.MIDI_OUTPUT_NAME
};

export type AppConfig = z.infer<typeof ConfigSchema>;

export const config: AppConfig = ConfigSchema.parse(raw);

export const WS_URL = `ws://${config.wsHost}:${config.wsPort}`;
