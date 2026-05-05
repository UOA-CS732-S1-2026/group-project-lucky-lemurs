import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserBuildingProgressDocument =
  HydratedDocument<UserBuildingProgress>;

@Schema({ timestamps: true })
export class UserBuildingProgress {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  buildingId: string;

  @Prop({ default: true })
  isUnlocked: boolean;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: 0 })
  bestScore: number;

  @Prop({ default: 0 })
  correctCount: number;

  @Prop({ default: 0 })
  totalQuestions: number;

  @Prop({ default: 0 })
  coinsAwarded: number;

  @Prop({ type: Date, default: null })
  unlockedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastPlayedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserBuildingProgressSchema =
  SchemaFactory.createForClass(UserBuildingProgress);
UserBuildingProgressSchema.index(
  { userId: 1, buildingId: 1 },
  { unique: true },
);
