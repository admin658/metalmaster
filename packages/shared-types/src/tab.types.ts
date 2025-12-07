export type TabFormat = 'tablature' | 'standard_notation' | 'ascii' | 'gp5' | 'gp6';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TabUpdate {
  title?: string;
  content?: string;
  format?: TabFormat;
  tuning?: string;
  difficulty_level?: DifficultyLevel;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tab {
  id: string;
  riff_id: string;
  title: string;
  content: string;
  format: TabFormat;
  tuning: string;
  difficulty_level: DifficultyLevel;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TabVersion {
  id: string;
  tab_id: string;
  version_number: number;
  content: string;
  changed_by: string;
  change_description?: string;
  created_at: string;
}

export interface TabNote {
  id: string;
  tab_id: string;
  line_number: number;
  note: string;
  user_id: string;
  created_at: string;
}
