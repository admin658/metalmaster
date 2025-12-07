import Pitchy from 'react-native-pitchy';

export async function startPitchy() {
  await Pitchy.init({ bufferSize: 4096 });
  Pitchy.start();
}

export function listenPitchy(cb: (pitch: number) => void) {
  return Pitchy.addListener(({ pitch }) => {
    cb(pitch);
  });
}

export function stopPitchy() {
  Pitchy.stop();
}
