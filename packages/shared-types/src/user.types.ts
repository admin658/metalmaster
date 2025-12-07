export interface UserProfileUpdate {
  username?: string;
  avatar_url?: string;
  bio?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  total_lessons_completed: number;
  total_practice_minutes: number;
  favorite_genres: string[];
}
