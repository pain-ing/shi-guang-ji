export interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  thumbnail_url?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    [key: string]: any;
  };
}
