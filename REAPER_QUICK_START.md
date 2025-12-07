# Quick Start: MIDI Output to Reaper

## Fastest Path to Real-Time MIDI Playback (5 Minutes)

### Windows Setup (loopMIDI)

1. **Get loopMIDI**

   ```
   https://www.tobias-erichsen.de/wp-content/uploads/2021/06/loopMIDI_installer_v1_13.zip
   ```

   - Download, extract, run installer
   - Launch loopMIDI from Start Menu
   - Click "+" button to create "MetalMaster to Reaper" port

2. **Configure Reaper**

   - Open Reaper
   - Preferences → MIDI Devices → MIDI Input
   - ✓ Check your loopMIDI port (e.g., "loopMIDI Port 1")
   - Create a new MIDI track: Right-click Arrange → Insert new track
   - Track Input: Set to your loopMIDI port
   - Add VST: Click FX → ReaGuitar (or Kontakt, OP-X, etc.)

3. **Use MetalMaster**
   - Load tab file (demo or upload .gp5)
   - **External MIDI Out** (under Transport) → pick your loopMIDI port (shows routing status)
   - If prompted, allow MIDI access in Chrome
   - Click Play
   - **Hear guitar sound in Reaper!**

### macOS Setup (IAC Driver)

1. **Enable IAC Driver**

   - Applications → Utilities → Audio MIDI Setup
   - Window → Show MIDI Studio
   - Double-click "IAC Driver" → Enable
   - Create "Bus 1" (auto-created)

2. **Configure Reaper**

   - Preferences → MIDI Devices → MIDI Input
   - ✓ Check "IAC Driver Bus 1"
   - Create MIDI track, set input to IAC Driver Bus 1
   - Add ReaGuitar VST

3. **Use MetalMaster**
   - External MIDI Out → "IAC Driver Bus 1"
   - Allow MIDI access if the browser prompts
   - Play!

### Verify It's Working

1. **Check Tab Player UI**

   - Look for status message under **External MIDI Out** (e.g., "Routing MIDI to loopMIDI Port 1")
   - If warning text appears → loopMIDI/IAC not running or browser blocked MIDI access

2. **Enable Monitor (Optional)**

   - Check "Monitor MIDI Events" in tab player
   - See live event count and last MIDI message
   - Confirms MIDI data is being sent

3. **Check Reaper**

   - Open MIDI Monitor: View → MIDI Monitor
   - Play a note in MetalMaster
   - Should see MIDI events scrolling in real-time
   - If events appear → connection good
   - If no events → check loopMIDI port names match

4. **Hear Sound**
   - Master fader not at -∞?
   - MIDI track armed (play button enabled)?
   - ReaGuitar window open and responsive?
   - If MIDI Monitor shows events but no sound → check instrument routing

## Workflow: Play Tab → Process in Reaper

```
MetalMaster          loopMIDI (Virtual Cable)        Reaper
┌─────────┐                                        ┌────────┐
│ Load Tab│ ──── MIDI Note On/Off ────────────────→│MIDI In │
│  Play ▶ │  (via WebMIDI + OS MIDI API)          │ Track  │
│         │                                         │        │
└─────────┘                                        │ReaGuitar│ ──→ 🎵
                                                   │(or VST) │
                                                   └────────┘
```

1. **Load tab**: `metallica-master_of_puppets.gp5`
2. **Select tempo**: 0.7x (slow it down to learn)
3. **Hit Play** in MetalMaster
4. **Hear guitar** from Reaper's ReaGuitar
5. **Adjust tone/effects** in Reaper (amp sim, reverb, etc.)
6. **Record** if desired (arm track before playing)

## Troubleshooting (90 Seconds)

| Problem                          | Check                                              |
| -------------------------------- | -------------------------------------------------- |
| No MIDI in Reaper                | ⚠️ loopMIDI running?                               |
|                                  | ✓ Port selected in Tab Player (green status)?      |
|                                  | ✓ Reaper MIDI input enabled?                       |
| MIDI received but no sound       | ReaGuitar window open? Master volume up?           |
|                                  | Track input correct (loopMIDI port)?               |
| Latency/delay                    | Reaper buffer size too large (Pref → Audio Device) |
| Windows: "No MIDI outputs found" | Run loopMIDI again; reload MetalMaster page        |

## Advanced: Monitor MIDI in Real-Time

The tab player now includes a **MIDI Monitor** tool:

1. Check "Monitor MIDI Events" (tab player controls)
2. Play a note
3. See:
   - **Events Sent**: Count of all MIDI messages
   - **Last Event**: Details of most recent note (key, velocity, channel)
   - **Reset Counter**: Clear the count

This helps verify MIDI is flowing before checking Reaper.

## Next Steps

- **Read full guide**: See `REAPER_MIDI_INTEGRATION.md` for advanced setup, channel routing, performance tips
- **Record MIDI**: Arm track in Reaper, play, then export as `.mid` file
- **Multi-track**: Use track selector in MetalMaster's panel to isolate tracks
- **Customize tone**: ReaGuitar → Settings for amp/effect chain tuning

---

**Status:** ✅ Ready to Use  
**Date:** December 2025
