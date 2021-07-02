import { Document } from 'mongoose';

export interface User extends Document {
  readonly firstname: string;
  readonly lastname: number;
  readonly email: string;
  readonly password: string;
  readonly mobilenumber: string;
  readonly gender: string;
  readonly created: string;
}