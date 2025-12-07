'use client';

import React, { useState } from 'react';

type SettingsTab = 'display' | 'notation' | 'player' | 'stylesheet';

interface SettingsPanelProps {
  api: any;
}

export default function SettingsPanel({ api }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('display');
  const [renderEngine, setRenderEngine] = useState('SVG');
  const [scale, setScale] = useState('100');
  const [layoutMode, setLayoutMode] = useState('Page');
  const fingering = ['Standard', 'Classical', 'Jazz'];

  const applyDisplaySettings = (updates: Record<string, unknown>) => {
    if (!api) return;
    try {
      const settings = {
        ...(api.settings ?? {}),
        display: {
          ...(api.settings?.display ?? {}),
          ...updates,
        },
      };
      if (api.updateSettings) {
        api.updateSettings(settings);
      } else {
        api.settings = settings;
      }
      api.render?.();
    } catch (err) {
      console.error('Failed to apply display settings', err);
    }
  };

  return (
    <div className="bg-zinc-950 border-b border-red-900/30">
      <div className="px-4 py-3 border-b border-red-900/30">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Settings</p>
      </div>

      <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('display')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
            activeTab === 'display'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Display
        </button>
        <button
          onClick={() => setActiveTab('notation')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
            activeTab === 'notation'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Notation
        </button>
        <button
          onClick={() => setActiveTab('player')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
            activeTab === 'player'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Player
        </button>
        <button
          onClick={() => setActiveTab('stylesheet')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
            activeTab === 'stylesheet'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Stylesheet
        </button>
      </div>

      <div className="px-4 py-4 border-t border-zinc-800 min-h-40 space-y-3">
        {activeTab === 'display' && (
          <div className="space-y-3">
            <SettingItem
              label="Render Engine"
              options={['SVG', 'Canvas']}
              value={renderEngine}
              onChange={(value) => {
                setRenderEngine(value);
                applyDisplaySettings({ renderEngine: value.toLowerCase() });
              }}
            />
            <SettingItem
              label="Scale"
              options={['50', '75', '100', '125', '150', '200']}
              value={scale}
              onChange={(value) => {
                setScale(value);
                applyDisplaySettings({ scale: Number(value) / 100 });
              }}
            />
            <SettingItem
              label="Layout Mode"
              options={['Page', 'Horizontal', 'Vertical']}
              value={layoutMode}
              onChange={(value) => {
                setLayoutMode(value);
                applyDisplaySettings({ layoutMode: value.toLowerCase() });
              }}
            />
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Justify Last System</label>
            </div>
          </div>
        )}

        {activeTab === 'notation' && (
          <div className="space-y-3">
            <SettingItem label="Fingering" options={fingering} />
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Tab Rhythm Stems</label>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Extend Bend Arrows on Tied Notes</label>
            </div>
          </div>
        )}

        {activeTab === 'player' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Volume</label>
              <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Metronome Volume</label>
              <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Show Cursors</label>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Highlight Notes</label>
            </div>
          </div>
        )}

        {activeTab === 'stylesheet' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Show Chord Diagrams</label>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Show Guitar Tuning</label>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <label className="text-sm text-zinc-200">Multi-Bar Rests</label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingItem({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50">
      <label className="text-sm text-zinc-200">{label}</label>
      <select
        className="px-2 py-1 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-200"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
