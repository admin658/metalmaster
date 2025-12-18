'use client';

import { useEffect, useRef, useState } from 'react';

type SplashVideoProps = {
  src: string;
};

export default function SplashVideo({ src }: SplashVideoProps) {
  const [show, setShow] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  useEffect(() => {
    if (!show) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay can be blocked on some browsers; skip in that case.
      });
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          onEnded={handleClose}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition hover:border-metal-accent/70 hover:text-metal-accent"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
