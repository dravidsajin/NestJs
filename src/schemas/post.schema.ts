import * as mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema({
  post_content: String,
  post_imgurl: String,
  like_count: Number,
  post_type: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  is_blocked: {
    type: String,
    enum: ['0', '1'],
    default: '0'
  },
  user_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  created: Date,
  modified: {
      type: Date,
      default: Date.now
    }
});