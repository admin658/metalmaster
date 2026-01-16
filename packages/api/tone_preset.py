from __future__ import annotations

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
