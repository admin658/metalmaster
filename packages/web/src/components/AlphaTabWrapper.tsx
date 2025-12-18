'use client';

import { useEffect, useRef } from 'react';
import * as alphaTab from '@coderline/alphatab';

export type AlphaTabScore = alphaTab.model.Score;

type AlphaTabWrapperProps = {
  fileSource: ArrayBuffer | string | null;
  onApiReady?: (api: alphaTab.AlphaTabApi) => void;
  onScoreLoaded?: (score: AlphaTabScore) => void;
  onPositionChanged?: (ms: number) => void;
  onError?: (message: string) => void;
  onPlaybackReady?: () => void;
  className?: string;
};

export default function AlphaTabWrapper({
  fileSource,
  onApiReady,
  onScoreLoaded,
  onPositionChanged,
  onError,
  onPlaybackReady,
  className,
}: AlphaTabWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null);
  const assetBase = typeof window !== 'undefined' ? `${window.location.origin}/alphatab` : '/alphatab';
  const fontDirectory = `${assetBase}/font/`;
  const soundFontUrl = `${assetBase}/soundfont/sonivox.sf2`;
  const onApiReadyRef = useRef(onApiReady);
  const onScoreLoadedRef = useRef(onScoreLoaded);
  const onPositionChangedRef = useRef(onPositionChanged);
  const onErrorRef = useRef(onError);
  const onPlaybackReadyRef = useRef(onPlaybackReady);
  const playerStateLogOnceRef = useRef(false);
  const playbackReadyOnceRef = useRef(false);

  useEffect(() => {
    onApiReadyRef.current = onApiReady;
  }, [onApiReady]);

  useEffect(() => {
    onScoreLoadedRef.current = onScoreLoaded;
  }, [onScoreLoaded]);

  useEffect(() => {
    onPositionChangedRef.current = onPositionChanged;
  }, [onPositionChanged]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onPlaybackReadyRef.current = onPlaybackReady;
  }, [onPlaybackReady]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!fileSource) return;
    playbackReadyOnceRef.current = false;
    let isCancelled = false;
    let api: any = null;
    let timeout: number | null = null;
    let readyPoll: number | null = null;
    let handlePlayerReady: () => void = () => {};
    let handleReady: () => void = () => {};
    let handleReadyForPlayback: () => void = () => {};
    let handleSoundFontLoaded: () => void = () => {};
    let handleSoundFontFailed: (err: any) => void = () => {};
    let handleScoreLoaded: (score: AlphaTabScore) => void = () => {};
    let handlePlayerPositionChanged: (event: { currentTime: number }) => void = () => {};

    const markPlaybackReady = () => {
      if (playbackReadyOnceRef.current || isCancelled) return;
      playbackReadyOnceRef.current = true;
      onPlaybackReadyRef.current?.();
    };

    const detachAll = () => {
      const a = api as any;
      a?.error?.off?.(handleError);
      a?.midiLoadFailed?.off?.(handleError);
      a?.soundFontLoadFailed?.off?.(handleSoundFontFailed);
      a?.soundFontLoaded?.off?.(handleSoundFontLoaded);
      a?.playerReady?.off?.(handlePlayerReady);
      a?.ready?.off?.(handleReady);
      a?.readyForPlayback?.off?.(handleReadyForPlayback);
      a?.scoreLoaded?.off?.(handleScoreLoaded);
      a?.playerPositionChanged?.off?.(handlePlayerPositionChanged);
    };

    const verifyStaticAsset = async (url: string, label: string) => {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        throw new Error(`AlphaTab ${label} missing at ${url} (${res.status})`);
      }
    };

    // Ensure the container itself can scroll.
    containerRef.current.style.overflow = 'auto';
    containerRef.current.style.position = 'relative';

    // Explicitly tell alphaTab where our static assets live to avoid auto-detect issues in Next.js.
    (window as any).ALPHATAB_ROOT = assetBase;
    (window as any).ALPHATAB_FONT = fontDirectory;

    const settings = {
      core: {
        // Use the UMD build for the worker/importScripts fallback to avoid module parsing errors.
        scriptFile: `${assetBase}/alphaTab.js`,
        fontDirectory,
        // Run on main thread to avoid importScripts issues in workers.
        useWorkers: false,
      },
      player: {
        enablePlayer: true,
        soundFont: soundFontUrl,
        percussionSoundFont: soundFontUrl,
        // Scroll inside the embedded container instead of the whole page.
        scrollElement: containerRef.current,
        // Only scroll when the cursor leaves the viewport; keep a small negative offset to avoid overshooting.
        scrollMode: 'offscreen',
        scrollOffsetY: -60,
        scrollSpeed: 200,
        nativeBrowserSmoothScroll: false,
      },
      display: {
        staveProfile: 'Tab',
        resources: {
          fontDirectory,
        },
        // Keep the viewport pinned to the playing cursor inside this container.
        scrollElement: containerRef.current ?? undefined,
      },
    } as any;

    const handleError = (err: any) => {
      console.error('AlphaTab error', err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Tab failed to load.';
      onErrorRef.current?.(message);
    };

    const boot = async () => {
      try {
        await Promise.all([
          verifyStaticAsset(`${assetBase}/alphaTab.js`, 'script'),
          verifyStaticAsset(soundFontUrl, 'soundfont'),
        ]);
      } catch (err) {
        handleError(err);
        return;
      }
      if (isCancelled || !containerRef.current) return;

      api = new alphaTab.AlphaTabApi(containerRef.current, settings as any);
      apiRef.current = api;

      // Make sure the settings above are applied (especially player.enablePlayer=true).
      api.updateSettings?.(settings as any);

      const handlePlayerReady = () => {
        console.info('AlphaTab player ready');
        api!.masterVolume = 1;
        api!.metronomeVolume = 0;
        api!.countInVolume = 0;
        api!.playbackSpeed = 1;
        markPlaybackReady();
      };

      handleReady = () => {
        if (api?.isReadyForPlayback) {
          markPlaybackReady();
        }
      };

      handleReadyForPlayback = () => {
        console.info('AlphaTab ready for playback');
        markPlaybackReady();
      };

      handleSoundFontLoaded = () => {
        console.info('AlphaTab soundfont loaded');
      };

      handleSoundFontFailed = (err: any) => {
        handleError(err ?? new Error('AlphaTab soundfont failed to load.'));
      };

      handleScoreLoaded = (score: AlphaTabScore) => {
        console.info('AlphaTab score loaded', score);
        onScoreLoadedRef.current?.(score);
        api!.render?.();
        // Fallback: if readyForPlayback never fires, at least try to mark playable.
        markPlaybackReady();
      };

      handlePlayerPositionChanged = (event: { currentTime: number }) => {
        onPositionChangedRef.current?.(event.currentTime);
      };

      onApiReadyRef.current?.(api);

      api.error.on(handleError);
      api.midiLoadFailed?.on(handleError);
      api.soundFontLoadFailed?.on(handleSoundFontFailed);
      api.soundFontLoaded?.on(handleSoundFontLoaded);
      api.playerReady?.on(handlePlayerReady);
      api.ready?.on(handleReady);
      api.readyForPlayback?.on(handleReadyForPlayback);
      api.scoreLoaded.on(handleScoreLoaded);
      api.playerPositionChanged.on(handlePlayerPositionChanged);
      api.playerStateChanged?.on((state: any) => {
        if (!playerStateLogOnceRef.current) {
          console.info('AlphaTab player state', state);
          playerStateLogOnceRef.current = true;
        }
      });

      try {
        console.info('AlphaTab loading source', typeof fileSource === 'string' ? fileSource : 'ArrayBuffer');
        api.load(fileSource);
      } catch (err: any) {
        handleError(err instanceof Error ? err : new Error('Failed to load tab data.'));
      }

      // Guard against silent hangs: if scoreLoaded hasn't fired within 12s, surface an error.
      timeout = window.setTimeout(() => {
        handleError(
          new Error('Tab is taking too long to load. Check network/static files for /tabs and /alphatab/font.')
        );
      }, 12000);

      api.scoreLoaded.on(() => {
        if (timeout !== null) window.clearTimeout(timeout);
      });
      api.midiLoadFailed?.on(() => {
        if (timeout !== null) window.clearTimeout(timeout);
      });
      api.readyForPlayback?.on(() => {
        if (timeout !== null) window.clearTimeout(timeout);
      });

      // Final fallback: poll isReadyForPlayback in case events never fire (seen in some Next.js setups).
      readyPoll = window.setInterval(() => {
        if (api?.isReadyForPlayback) {
          markPlaybackReady();
          if (readyPoll !== null) {
            window.clearInterval(readyPoll);
            readyPoll = null;
          }
        }
      }, 500);
    };

    void boot();

    return () => {
      isCancelled = true;
      if (timeout !== null) window.clearTimeout(timeout);
      if (readyPoll !== null) window.clearInterval(readyPoll);
      detachAll();
      api?.destroy();
    };
  }, [assetBase, fileSource, fontDirectory, soundFontUrl]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'w-full h-[65vh] bg-slate-900/80 border border-white/10 rounded-xl overflow-auto'}
    />
  );
}
