import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateId } from '../../common/id.util';
import { UserRole } from '../../common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ default: () => generateId('user'), unique: true, index: true })
  id: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: '/images/avatars/default.png' })
  avatarUrl: string;

  @Prop({ enum: UserRole, default: UserRole.User })
  role: UserRole;

  @Prop({ default: 0 })
  totalScore: number;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
