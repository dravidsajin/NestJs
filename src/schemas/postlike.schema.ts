import * as mongoose from 'mongoose';

export const PostLikeSchema = new mongoose.Schema({
  post_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'posts' }],
  user_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  created: Date,
  modified: {
      type: Date,
      default: Date.now
    }
});