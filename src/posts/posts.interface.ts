import { Document } from 'mongoose';

export interface Post extends Document {
  readonly post_content: string;
  readonly post_imgurl: string;
  readonly user_id: string;
  readonly like_count: number;
  readonly post_type: string;
  readonly is_blocked: string;
}