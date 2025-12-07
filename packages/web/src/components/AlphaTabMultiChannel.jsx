import React, { useEffect, useRef, useState } from "react";
import * as alphaTab from "@coderline/alphatab";

export default function AlphaTabMultiChannel() {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const midiOutputs = useRef([]);
  const midiOutRef = useRef(null);

  const [availableOutputs, setAvailableOutputs] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState("");

  const channelMap = {
    0: 0,
    1: 1,
    2: 9, // Track 2 → MIDI channel 10 (drums)
  };

  useEffect(() => {
    async function init() {
      const midi = await navigator.requestMIDIAccess();
      const outs = Array.from(midi.outputs.values());
      midiOutputs.current = outs;
      setAvailableOutputs(outs);

      const api = new alphaTab.AlphaTabApi(containerRef.current, {
        player: { enablePlayer: true },
        core: { autoSize: true },
      });
      apiRef.current = api;

      api.player.notePlayed.on((e) => {
        if (!midiOutRef.current) return;

        const trackIndex = e.track.index;
        const channel = channelMap[trackIndex] ?? trackIndex;

        midiOutRef.current.send([0x90 + channel, e.note, Math.floor(e.velocity * 127)]);
      });

      api.player.noteReleased.on((e) => {
        if (!midiOutRef.current) return;

        const trackIndex = e.track.index;
        const channel = channelMap[trackIndex] ?? trackIndex;

        midiOutRef.current.send([0x80 + channel, e.note, 0]);
      });

      api.loadScore("your-file.gp");
    }

    init();
  }, []);

  const handleSelectOutput = (e) => {
    const id = e.target.value;
    setSelectedOutput(id);
    midiOutRef.current = midiOutputs.current.find((o) => o.id === id) || null;

    console.log("Using output:", midiOutRef.current?.name);
  };

  return (
    <div>
      <h2>alphaTab Multi-Channel Routing → DAW</h2>

      <label>MIDI Output Device:</label>
      <select value={selectedOutput} onChange={handleSelectOutput}>
        <option value="">-- Select MIDI Output --</option>
        {availableOutputs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          border: "1px solid #aaa",
          minHeight: 300,
          marginTop: "1rem",
        }}
      />
    </div>
  );
}
