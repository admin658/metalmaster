import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  videoUrl?: string;
}

interface Riff {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  difficulty?: string;
  tuning?: string;
}

interface JamTrack {
  id: string;
  title: string;
  key?: string;
  description?: string;
  tempo?: number;
  duration?: string;
  audio_url?: string;
}

let supabaseInstance: any = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
};

const fallbackLessons: Lesson[] = [
  {
    id: 'local-lesson-1',
    title: 'Picking & Tone Foundations',
    description: 'Warmup flow covering hand sync, palm mutes, and tone shaping basics.',
    difficulty: 'Beginner',
    videoUrl: '/IMG_4520.MOV',
  },
  {
    id: 'local-lesson-2',
    title: 'Thrash Gallops & Precision',
    description: 'Gallops and stamina drills with tight metronome focus.',
    difficulty: 'Intermediate',
    videoUrl: '/IMG_4521.MOV',
  },
];

const localJamTracks: JamTrack[] = [
  {
    id: 'jam1',
    title: 'Jam Track 1',
    description: 'Backing track from the jam library.',
    audio_url: '/jam/jam1.mp3',
  },
  {
    id: 'jam2',
    title: 'Jam Track 2',
    description: 'Backing track from the jam library.',
    audio_url: '/jam/jam2.mp3',
  },
  {
    id: 'jam3',
    title: 'Jam Track 3',
    description: 'Backing track from the jam library.',
    audio_url: '/jam/jam3.mp3',
  },
  {
    id: 'jam4',
    title: 'Jam Track 4',
    description: 'Backing track from the jam library.',
    audio_url: '/jam/jam4.mp3',
  },
];

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const { data, error: err } = await getSupabase().from('lessons').select('*');
        if (err) throw err;
        const remote = data || [];
        setLessons([...fallbackLessons, ...remote]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
        setLessons(fallbackLessons);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  return { lessons, loading, error };
}

export function useRiffs() {
  const [riffs, setRiffs] = useState<Riff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const { data, error: err } = await getSupabase().from('riffs').select('*');
        if (err) throw err;
        setRiffs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch riffs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  return { riffs, loading, error };
}

export function useJamTracks() {
  const [jamTracks, setJamTracks] = useState<JamTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      let tracks = localJamTracks;
      try {
        const { data, error: err } = await getSupabase().from('jam_tracks').select('*');
        if (err) throw err;
        if (data && data.length > 0) {
          tracks = [...data, ...localJamTracks];
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jam tracks');
      } finally {
        setJamTracks(tracks);
        setLoading(false);
      }
    })();
  }, []);
  
  return { jamTracks, loading, error };
}

export function useXP(userId: string) {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    (async () => {
      try {
        const { data, error: err } = await getSupabase().from('users').select('xp,level').eq('id', userId).single();
        if (err) throw err;
        setXP(data?.xp || 0);
        setLevel(data?.level || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch XP data');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);
  
  return { xp, level, loading, error };
}

export function useSubscriptionStatus(userId: string) {
  const [status, setStatus] = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    (async () => {
      try {
        const { data, error: err } = await getSupabase().from('users').select('stripe_status').eq('id', userId).single();
        if (err) throw err;
        setStatus(data?.stripe_status || 'free');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);
  
  return { status, loading, error };
}
