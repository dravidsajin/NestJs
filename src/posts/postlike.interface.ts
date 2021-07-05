import { Document } from 'mongoose';

export interface PostLikes extends Document {
  post_id: string;
  user_id: string;
}