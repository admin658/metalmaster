// Simple autocorrelation pitch detection for web
export default function usePitchDetection() {
  let audioContext: AudioContext;
  let source: MediaStreamAudioSourceNode;
  let analyser: AnalyserNode;
  let buffer = new Float32Array(2048);

  async function start() {
    audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
  }

  function detectPitch(): number | null {
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

  return { start, detectPitch };
}
