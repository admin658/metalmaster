from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Dict, List


def _clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def _scale_0_1_to_0_10(value: float) -> float:
    return _clamp(value, 0.0, 1.0) * 10.0


@dataclass
class TonePreset:
    """Serializable tone preset for plugin mapping and storage."""

    # Noise gate
    gate_threshold: float = -60.0  # dB
    gate_release: float = 100.0  # ms

    # Pedal (boost/OD)
    pedal_model: str = "None"
    pedal_drive: float = 0.0
    pedal_tone: float = 0.5
    pedal_level: float = 1.0
    pedal_enabled: bool = False

    # Amplifier
    amp_model: str = "UnknownAmp"
    amp_gain: float = 0.5
    amp_bass: float = 0.5
    amp_mid: float = 0.5
    amp_treble: float = 0.5
    amp_presence: float = 0.5
    amp_depth: float = 0.5
    amp_master: float = 0.5

    # Cabinet / IR
    cab_ir: str = ""
    cab_metadata: Dict[str, str] = field(
        default_factory=dict
    )  # e.g., {"cab": "Mesa412", "mic": "SM57"}

    # Post-EQ
    post_eq: List[Dict[str, float]] = field(
        default_factory=list
    )  # list of {"freq":..., "gain":..., "Q":...}


def map_to_neural_fortincali(preset: TonePreset) -> Dict[str, object]:
    """
    Map TonePreset to a Neural DSP Fortin Cali preset structure.
    Returns a dictionary that could be serialized to the Fortin Cali preset format.
    """
    plugin_preset: Dict[str, object] = {}

    plugin_preset["GateThreshold"] = preset.gate_threshold
    plugin_preset["GateRelease"] = preset.gate_release

    pedal_model = preset.pedal_model.strip().lower()
    pedal_enabled = preset.pedal_enabled and pedal_model in {"tubescreamer", "ts9", "808"}
    if pedal_enabled:
        plugin_preset["Pedal"] = {
            "type": "TS808",
            "drive": _scale_0_1_to_0_10(preset.pedal_drive),
            "tone": _scale_0_1_to_0_10(preset.pedal_tone),
            "level": _scale_0_1_to_0_10(preset.pedal_level),
            "enabled": True,
        }
    else:
        plugin_preset["Pedal"] = {"type": "TS808", "enabled": False}

    amp_type_map = {
        "5150": "CaliIII",
        "jcm800": "Brit800",
    }
    amp_type = amp_type_map.get(preset.amp_model.strip().lower(), preset.amp_model)
    plugin_preset["Amp"] = {
        "type": amp_type,
        "gain": _scale_0_1_to_0_10(preset.amp_gain),
        "bass": _scale_0_1_to_0_10(preset.amp_bass),
        "mid": _scale_0_1_to_0_10(preset.amp_mid),
        "treble": _scale_0_1_to_0_10(preset.amp_treble),
        "presence": _scale_0_1_to_0_10(preset.amp_presence),
        "depth": _scale_0_1_to_0_10(preset.amp_depth),
        "master": _scale_0_1_to_0_10(preset.amp_master),
    }

    if preset.cab_ir:
        plugin_preset["CabIR"] = {"file": preset.cab_ir}
    else:
        cab = preset.cab_metadata.get("cab", "")
        mic = preset.cab_metadata.get("mic", "")
        plugin_preset["Cabinet"] = {"cab": cab, "mic": mic}

    def _map_eq_band(band: Dict[str, float]) -> Dict[str, float]:
        return {
            "freq": band["freq"],
            "gain": band["gain"],
            "Q": band.get("Q", band.get("q", 1.0)),
        }

    plugin_preset["PostEQ"] = [_map_eq_band(band) for band in preset.post_eq]
    return plugin_preset


def tonepreset_to_helix_json(preset: TonePreset) -> str:
    helix_preset: Dict[str, object] = {
        "meta": {"product": "Helix Native", "version": "3.50"},
        "blocks": [],
    }

    blocks = helix_preset["blocks"]

    blocks.append(
        {
            "block": "NoiseGate",
            "params": {
                "Thresh": preset.gate_threshold,
                "Decay": preset.gate_release,
            },
        }
    )

    if preset.pedal_enabled:
        pedal_name = preset.pedal_model.strip() or "Pedal"
        blocks.append(
            {
                "block": pedal_name,
                "params": {
                    "Drive": round(_scale_0_1_to_0_10(preset.pedal_drive), 2),
                    "Tone": round(_scale_0_1_to_0_10(preset.pedal_tone), 2),
                    "Level": round(_scale_0_1_to_0_10(preset.pedal_level), 2),
                },
            }
        )

    helix_amp_map = {
        "5150": "Cali IV Lead",
        "jcm800": "Brit 2204",
    }
    amp_name = helix_amp_map.get(preset.amp_model.strip().lower(), preset.amp_model)
    blocks.append(
        {
            "block": amp_name,
            "params": {
                "Drive": round(_scale_0_1_to_0_10(preset.amp_gain), 2),
                "Bass": round(_scale_0_1_to_0_10(preset.amp_bass), 2),
                "Mid": round(_scale_0_1_to_0_10(preset.amp_mid), 2),
                "Treble": round(_scale_0_1_to_0_10(preset.amp_treble), 2),
                "Presence": round(_scale_0_1_to_0_10(preset.amp_presence), 2),
                "Resonance": round(_scale_0_1_to_0_10(preset.amp_depth), 2),
                "Master": round(_scale_0_1_to_0_10(preset.amp_master), 2),
            },
        }
    )

    if preset.cab_ir:
        blocks.append(
            {
                "block": "IR",
                "params": {
                    "File": preset.cab_ir,
                    "LowCut": 80.0,
                    "HighCut": 12000.0,
                },
            }
        )
    else:
        cab_name = preset.cab_metadata.get("cab", "4x12 Cab")
        mic_name = preset.cab_metadata.get("mic", "SM57")
        blocks.append(
            {
                "block": "Cab",
                "params": {
                    "CabModel": cab_name,
                    "Mic": mic_name,
                    "LowCut": 80.0,
                    "HighCut": 12000.0,
                },
            }
        )

    if preset.post_eq:
        eq_params: Dict[str, float] = {}
        for i, band in enumerate(preset.post_eq[:3], start=1):
            eq_params[f"Freq{i}"] = band["freq"]
            eq_params[f"Gain{i}"] = band["gain"]
            eq_params[f"Q{i}"] = band.get("Q", band.get("q", 1.0))
        blocks.append(
            {
                "block": "ParametricEQ",
                "params": eq_params,
            }
        )

    return json.dumps(helix_preset, indent=2)
