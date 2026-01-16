// Simple autocorrelation pitch detection for web
export default function usePitchDetection() {
  let audioContext: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let stream: MediaStream | null = null;
  let buffer = new Float32Array(2048);

  async function start(deviceId?: string | null) {
    audioContext = new AudioContext();
    const constraints: MediaStreamConstraints = deviceId
      ? { audio: { deviceId: { exact: deviceId } } }
      : { audio: true };

    stream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);

    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (audioContext) {
      try {
        audioContext.close();
      } catch (e) {
        // ignore
      }
      audioContext = null;
    }
    source = null;
    analyser = null;
  }

  function detectPitch(): number | null {
    if (!analyser || !audioContext) return null;
    analyser.getFloatTimeDomainData(buffer);

    // Autocorrelation pitch detection
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) return null;

    let lastCorrelation = 1;
    for (let offset = 1; offset < buffer.length / 2; offset++) {
      let correlation = 0;
      for (let i = 0; i < buffer.length - offset; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      correlation = 1 - correlation / (buffer.length - offset);

      if (correlation > 0.9 && correlation > lastCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
      lastCorrelation = correlation;
    }

    if (bestOffset === -1) return null;

    const sampleRate = audioContext.sampleRate;
    return sampleRate / bestOffset;
  }

  return { start, stop, detectPitch };
}
