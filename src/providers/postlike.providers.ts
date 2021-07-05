import { Connection } from 'mongoose';
import { PostLikeSchema } from '../schemas/postlike.schema';

export const postLikeProviders = [
  {
    provide: 'POSTLIKES_MODEL',
    useFactory: (connection: Connection) => connection.model('postlikes', PostLikeSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];