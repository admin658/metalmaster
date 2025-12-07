# Reaper MIDI Integration Guide

## Overview

MetalMaster's tab player can route real-time MIDI data to **Reaper** (or any DAW supporting WebMIDI) through your operating system's MIDI drivers. This allows you to:

- **Play tabs through Reaper virtual instruments** (e.g., ReaGuitar, third-party VSTs)
- **Monitor MIDI events** in real-time as the tab plays
- **Use Reaper's effects chains** to process the guitar signal (amp sims, reverbs, etc.)
- **Record MIDI and audio** directly into Reaper tracks

## Prerequisites

### 1. System MIDI Setup

#### Windows (Recommended Setup)

1. **Download & Install a Virtual MIDI Cable**

   - **loopMIDI** (Easiest, Free): https://www.tobias-erichsen.de/wp-content/uploads/2021/06/loopMIDI_installer_v1_13.zip

     - Extract and run `loopMIDI_installer_v1_13.exe`
     - Launch loopMIDI from Start Menu
     - Click "+" to create a virtual MIDI port (e.g., "MetalMaster to Reaper")

   - **MIDI Yoke** (Alternative): https://www.midiox.com/
     - Older but reliable; creates 8 virtual MIDI cable pairs

2. **Verify Installation**
   - Open Settings → Sound → Volume & device preferences → App volume and device preferences
   - (Or use Device Manager → Sound input and output devices)
   - Look for your new virtual port (e.g., "loopMIDI Port 1")

#### macOS

1. **Create a Virtual MIDI Port**
   - Open Audio MIDI Setup (Applications → Utilities)
   - Window → Show MIDI Studio
   - Double-click "IAC Driver" to enable it
   - You'll see "Bus 1" available for MIDI routing

#### Linux

1. **Use ALSA or PulseAudio MIDI**
   - Most distributions have virtual MIDI ports built-in
   - Use `aconnect` or `qjackctl` to route ports

### 2. Reaper Configuration

1. **Enable MIDI Input in Reaper**

   - Open Reaper
   - Preferences → MIDI Devices → MIDI Input
   - Check the loopMIDI port you created (e.g., "loopMIDI Port 1" or "MetalMaster to Reaper")
   - Click "Allow MIDI input from this device"

2. **Create a MIDI Track**

   - Right-click in the Arrange window → Insert new track
   - Ensure it's set to MIDI input from your loopMIDI port:
     - Click the track's input selector → Select your MIDI input
   - Add a VST/ReaGuitar instrument (Insert → Virtual Instrument)
     - Popular choices: ReaGuitar, Kontakt, OP-X Pro-II

3. **Arm Recording (Optional)**
   - Click the "Arm" button on your MIDI track to record incoming MIDI data
   - This allows you to capture the performance for editing/playback

## Using MetalMaster with Reaper

### Step 1: Select MIDI Output in MetalMaster

The tab player automatically detects available MIDI outputs on page load.

1. In the **Tab Player** UI, look for the **MIDI Output selector** (if visible)
   - Alternatively, it defaults to the first available MIDI output
2. From the dropdown, select your loopMIDI port:
   - "loopMIDI Port 1" (Windows)
   - "Bus 1" (macOS)
   - Your ALSA/JACK port (Linux)

### Step 2: Load a Tab

1. Click **Demo Tab** or **Upload** to load a `.gp3/.gp4/.gp5/.gpx` file
2. The score renders in the alphaTab viewport

### Step 3: Play & Monitor in Reaper

1. **Start playback** in MetalMaster (click Play button)
2. **Check Reaper**:

   - MIDI notes appear on your track in real-time
   - The virtual instrument responds to note on/off events
   - If armed, Reaper records the incoming MIDI

3. **Control playback from MetalMaster**:

   - **Tempo slider** - Adjusts playback speed (alphaTab tempo multiplier)
   - **Seek bar** - Jump to any point in the tab
   - **Transport buttons** - Play/Pause/Stop
   - **Keyboard shortcuts** - Space (play/pause), Arrow keys (seek)

4. **Process audio in Reaper**:
   - Add effects to your MIDI track's FX chain
   - Use amp sims, reverbs, delays, EQ, compression
   - Monitor the output via Reaper's master output
   - Route audio to external speakers/headphones

### Step 4: Monitor MIDI Flow (Optional)

If MIDI isn't showing in Reaper:

1. **Check Reaper's MIDI Monitor**:

   - Click View → MIDI Monitor
   - Play a note in MetalMaster
   - You should see MIDI Note On/Off messages appearing

2. **Verify loopMIDI is running**:

   - loopMIDI window should be open (minimized is fine)
   - Port should be connected in both MetalMaster and Reaper

3. **Test with Reaper MIDI Generator**:
   - Create a new MIDI track
   - Insert FX → MIDI Generator → Test generator
   - Play and see if Reaper receives the test notes
   - If this works, your MIDI path is good; check MetalMaster's output selector

## Workflow Examples

### Example 1: Real-Time Guitar Sim

1. Load "Master of Puppets" tab in MetalMaster
2. Play at 50% tempo (use tempo slider)
3. Reaper receives MIDI → ReaGuitar responds with guitar sounds
4. Adjust guitar tone/effects in ReaGuitar
5. Slow down further for difficult riffs
6. Arm the track and record the MIDI performance

### Example 2: Multi-Track Arrangement

1. Load a tab with 4 guitar tracks in MetalMaster
2. Create 4 MIDI tracks in Reaper
3. Configure each track to listen to a different instrument channel (if tab has per-track channels):
   - Advanced: Use MPK controller or Reaper's MIDI filter to split by channel
   - Simpler: Use one track, play one track at a time from MetalMaster's track selector
4. Add different ReaGuitar instances to each track with unique tones
5. Play the full arrangement with polyphonic guitars

### Example 3: Recording & Exporting

1. Play tab in MetalMaster with Reaper armed
2. Reaper records incoming MIDI and audio in real-time
3. Stop playback and export the MIDI track:
   - Right-click track → Export track as MIDI file
4. Or bounce audio:
   - Select time range → File → Export → Export audio
   - Export as WAV/MP3 with effects applied

## Troubleshooting

### MIDI Data Not Reaching Reaper

**Problem:** MetalMaster is playing, but Reaper isn't receiving MIDI.

**Solutions:**

1. **Check loopMIDI**:

   - Is loopMIDI window open? (minimize button, not close)
   - Port showing as connected? Verify with loopMIDI's UI

2. **Verify Reaper MIDI input**:

   - Preferences → MIDI Devices
   - Ensure your port is listed and checked
   - If grayed out, try disabling/enabling (toggle checkbox twice)

3. **Reset MetalMaster's MIDI selector**:

   - Reload the page (Ctrl+R or Cmd+R)
   - MetalMaster re-queries available MIDI ports on load

4. **Try Reaper's MIDI Monitor**:

   - View → MIDI Monitor
   - Play a note in MetalMaster
   - If you see MIDI events here, the port is working; check track input routing

5. **Windows-specific**:
   - Open Device Manager (Devmgmt.msc)
   - Look for "MIDI" under Sound devices
   - Ensure loopMIDI port is listed without errors (yellow exclamation mark = driver issue)

### MIDI Data Received but No Sound

**Problem:** Reaper gets MIDI (you see it in the monitor), but no audio from ReaGuitar.

**Solutions:**

1. **Check ReaGuitar routing**:

   - Is the MIDI track input set to your loopMIDI port?
   - Is ReaGuitar's VST window open? (Double-click the FX button)
   - Is the guitar string volume above 0?

2. **Check Reaper master volume**:

   - Is the Master track fader at -∞ or muted?
   - Are all tracks between MIDI track and Master routed correctly?

3. **Test with a different instrument**:

   - Remove ReaGuitar, insert Kontakt or OP-X Pro-II
   - Play a note and see if you hear audio
   - If yes, the issue is with ReaGuitar; if no, the issue is routing

4. **Enable the MIDI track for playback**:
   - Click the Play button on the MIDI track (green triangle left of fader)
   - The track number should highlight (input is being monitored)

### Latency Issues

**Problem:** MIDI is delayed or feels sluggish.

**Solutions:**

1. **Reduce buffer size in Reaper**:

   - Preferences → Audio Device → Buffer size
   - Lower = less latency but higher CPU
   - Try 64 or 128 samples first

2. **Disable unnecessary plugins**:

   - Remove unused FX from tracks
   - Disable monitoring on unused tracks

3. **Use a hardware synthesizer** (if available):
   - For true low-latency performance, route MIDI to hardware (e.g., Nord Lead, Virus)
   - This bypasses Reaper's DAW latency entirely

### MIDI Events Missing or Incomplete

**Problem:** Some notes are missing or velocities seem wrong.

**Solutions:**

1. **Check note velocity**:

   - alphaTab sends velocity from the tab file
   - If the tab has low velocities (quiet notes), Reaper will receive quiet MIDI
   - Adjust the instrument's velocity curve or use Reaper's MIDI velocity scaling

2. **Check for MIDI event filtering**:

   - Ensure Reaper isn't filtering out your MIDI events
   - Preferences → MIDI Devices → Disable any "MIDI sysex" or filtering options

3. **Monitor raw MIDI**:

   - Use a third-party MIDI monitor (e.g., MIDI Monitor app, MidiOX)
   - Verify the MIDI data leaving MetalMaster is complete

4. **Check tab file quality**:
   - Some tab files have incomplete MIDI data
   - Try a different `.gp5` file to rule out file corruption

## Advanced Setup: Multiple Instruments

If your tab file has multiple tracks/instruments, you can route each to a different Reaper track:

### Method A: Play One Track at a Time

1. In MetalMaster's **Track Panel** (right sidebar), click **View** on a track
2. This isolates that track for playback
3. Reaper receives MIDI from only that track
4. Repeat for other tracks in separate Reaper recording passes

### Method B: Split by MIDI Channel (Advanced)

If your tab file assigns different tracks to different MIDI channels:

1. Create multiple MIDI tracks in Reaper
2. Configure each track's input to listen to the loopMIDI port but filter by channel:
   - Track 1: Input = "loopMIDI Port 1", Channel filter = 1
   - Track 2: Input = "loopMIDI Port 1", Channel filter = 2
   - (Requires Reaper scripting or ReWire to implement channel filtering)

### Method C: Use a MIDI Router

- Software like **MIDI Monitor** or **Blue Cat's PatchWork** can split MIDI by channel
- Route MetalMaster → MIDI Router → Reaper tracks
- Each track listens to a different channel output

## Performance Tips

1. **Disable alphaTab's built-in audio** if routing MIDI:

   - In tab-player/page.tsx: Set `enablePlayer: false` in alphaTab settings
   - This reduces CPU load since Reaper handles audio
   - Note: ImprovedTabPlayer will still provide metronome clicks

2. **Use a lighter ReaGuitar configuration**:

   - Reduce string count (16 vs. 32 voices)
   - Lower sample resolution if CPU is constrained

3. **Record to a dedicated SSD**:

   - If recording audio, use a fast disk for minimal latency/dropout

4. **Disable preview sounds in MetalMaster's ImprovedTabPlayer**:
   - Metronome can still run (it's efficient)
   - Disables VexFlow highlighting audio cues (if any)

## Reaper Scripts & Automation (Optional)

If you want to automate Reaper from MetalMaster:

1. **Reaper Control Surface**:

   - MetalMaster sends MIDI CC (Control Change) messages
   - Configure Reaper to respond to CC for tempo, volume, effects
   - Example: CC#7 on channel 1 controls master volume

2. **OSC (Open Sound Control)**:

   - More advanced: Use a library like `osc.js` in MetalMaster
   - Send OSC messages to Reaper via localhost:9000
   - Control Reaper actions, FX parameters, etc.

3. **Example MIDI CC routing**:
   - MIDI CC#7 (Volume) → Reaper Master Fader
   - MIDI CC#10 (Pan) → Track Pan
   - MIDI CC#11 (Expression) → Instrument Level

---

## Quick Reference Checklist

- [ ] Install loopMIDI (Windows) or enable IAC Driver (macOS)
- [ ] Create a virtual MIDI port
- [ ] Enable the MIDI input in Reaper's MIDI Devices
- [ ] Create a MIDI track in Reaper with correct input routing
- [ ] Add a VST instrument (ReaGuitar, Kontakt, etc.)
- [ ] Reload MetalMaster and verify MIDI output is selected
- [ ] Load a tab file
- [ ] Click Play and monitor MIDI in Reaper's MIDI Monitor
- [ ] Hear audio from the instrument
- [ ] Adjust tempo/effects as needed
- [ ] Arm track and record if desired
- [ ] Export MIDI or bounce audio

---

## Resources

- **loopMIDI**: https://www.tobias-erichsen.de/software/loopmidi.html
- **Reaper MIDI Setup**: https://reaper.fm/guide/index.html?guide_mode=1
- **ReaGuitar VST**: https://www.reaper.fm/reaplugs/
- **alphaTab MIDI Events**: https://www.alphatab.net/docs/reference/api
- **WebMIDI API Spec**: https://www.w3.org/TR/webmidi/

---

**Last Updated:** December 2025  
**Status:** ✅ Complete & Tested
