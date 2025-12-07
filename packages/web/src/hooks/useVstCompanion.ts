'use client';

import { useCallback, useEffect, useRef } from 'react';

const WS_URL = 'ws://127.0.0.1:47800';
const RECONNECT_DELAY_MS = 1500;

type CompanionMessage =
  | { type: 'noteOn'; channel?: number; note: number; velocity?: number }
  | { type: 'noteOff'; channel?: number; note: number; velocity?: number }
  | { type: 'allNotesOff'; channel?: number };

export function useVstCompanion() {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onclose = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg: CompanionMessage) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  const sendNoteOn = useCallback(
    (note: number, velocity = 100, channel = 0) =>
      sendMessage({ type: 'noteOn', note, velocity, channel }),
    [sendMessage]
  );

  const sendNoteOff = useCallback(
    (note: number, velocity = 0, channel = 0) =>
      sendMessage({ type: 'noteOff', note, velocity, channel }),
    [sendMessage]
  );

  const allNotesOff = useCallback(
    (channel = 0) => sendMessage({ type: 'allNotesOff', channel }),
    [sendMessage]
  );

  return { sendNoteOn, sendNoteOff, allNotesOff };
}

export default useVstCompanion;
