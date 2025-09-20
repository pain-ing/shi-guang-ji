export interface Diary {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
  is_public?: boolean;
  media_files?: string[];
}
