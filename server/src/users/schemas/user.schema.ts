import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateId } from '../../common/id.util';
import { QuestionCategory, UserRole } from '../../common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserCategoryStat {
  @Prop({ type: String, enum: QuestionCategory, required: true })
  category: QuestionCategory;

  @Prop({ default: 0 })
  correctCount: number;

  @Prop({ default: 0 })
  incorrectCount: number;
}

const UserCategoryStatSchema = SchemaFactory.createForClass(UserCategoryStat);

@Schema({ _id: false })
export class UserBadge {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: Date.now })
  earnedAt: Date;
}

const UserBadgeSchema = SchemaFactory.createForClass(UserBadge);

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

  @Prop({ type: String, enum: UserRole, default: UserRole.User })
  role: UserRole;

  @Prop({ default: 0 })
  totalScore: number;

  @Prop({ default: 0 })
  coins: number;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  bestStreak: number;

  @Prop({ type: String, enum: QuestionCategory, default: null })
  strongestCategory: QuestionCategory | null;

  @Prop({ type: [UserCategoryStatSchema], default: [] })
  categoryStats: UserCategoryStat[];

  @Prop({ type: [UserBadgeSchema], default: [] })
  badges: UserBadge[];

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
