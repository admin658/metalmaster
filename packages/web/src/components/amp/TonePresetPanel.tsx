import React from 'react';
import { GuitarAmpPreset } from '../../audio/GuitarAmpSimulator';

type Props = {
  preset: GuitarAmpPreset;
  presets?: { label: string; preset: GuitarAmpPreset }[];
  onSelectPreset?: (preset: GuitarAmpPreset) => void;
  onChange?: (preset: GuitarAmpPreset) => void;
};

export default function TonePresetPanel({ preset, presets, onSelectPreset, onChange }: Props) {
  const update = (key: string, value: number | string) => {
    if (!onChange) return;
    if (key === 'gain' || key === 'distortion') {
      onChange({ ...preset, [key]: value });
    } else if (key === 'bass' || key === 'mid' || key === 'treble') {
      onChange({ ...preset, eq: { ...preset.eq, [key === 'bass' ? 'bass' : key === 'mid' ? 'mid' : 'treble']: value } });
    } else {
      onChange({ ...preset, [key]: value });
    }
  };

  return (
    <div
      style={{
        padding: 14,
        background: 'linear-gradient(145deg,#0b1020,#0f172a)',
        borderRadius: 12,
        border: '1px solid rgba(148,163,184,0.3)',
        color: 'white',
        fontFamily: 'monospace',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
          Amp Sim (VST)
        </h3>
        {presets && (
          <select
            value={preset.name}
            onChange={(e) => {
              const next = presets.find((p) => p.preset.name === e.target.value);
              if (next && onSelectPreset) onSelectPreset(next.preset);
            }}
            style={{
              background: '#0b1020',
              color: 'white',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: 12,
            }}
          >
            {presets.map((p) => (
              <option key={p.label} value={p.preset.name}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <Knob label="Gain" min={0} max={1} step={0.01} value={preset.gain} onChange={(v) => update('gain', v)} />
        <Knob label="Bass" min={-20} max={20} step={0.5} value={preset.eq.bass} onChange={(v) => update('bass', v)} />
        <Knob label="Mid" min={-20} max={20} step={0.5} value={preset.eq.mid} onChange={(v) => update('mid', v)} />
        <Knob label="Treble" min={-20} max={20} step={0.5} value={preset.eq.treble} onChange={(v) => update('treble', v)} />
        <Knob label="Reverb" min={0} max={1} step={0.01} value={preset.reverb} onChange={(v) => update('reverb', v)} />
        <div style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>
          {preset.irUrl ? `Cab IR: ${preset.irUrl}` : 'Cab IR: default'}
        </div>
      </div>
    </div>
  );
}

function Knob({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
      <span style={{ color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: '#f97316' }}
      />
      <span style={{ color: '#94a3b8' }}>{value.toFixed(2)}</span>
    </label>
  );
}
