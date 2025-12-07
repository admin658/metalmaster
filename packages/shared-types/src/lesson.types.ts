export type LessonCategory = 'technique' | 'theory' | 'rhythm' | 'lead' | 'songwriting';
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LessonContentType = 'text' | 'image' | 'video' | 'quiz' | 'exercise';

export interface LessonUpdate {
  title?: string;
  description?: string;
  category?: LessonCategory;
  difficulty_level?: LessonDifficulty;
  duration_minutes?: number;
  video_url?: string;
  content?: string;
  instructor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty_level: LessonDifficulty;
  duration_minutes: number;
  video_url?: string;
  content: string;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

export interface LessonWithProgress extends Lesson {
  is_completed: boolean;
  progress_percentage: number;
  last_accessed: string | null;
}

export interface LessonContent {
  id: string;
  lesson_id: string;
  order: number;
  type: LessonContentType;
  content: string;
  metadata?: Record<string, unknown>;
}
