import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { QuizMode, SessionStatus } from '../../common/enums';
import { generateId } from '../../common/id.util';

export type QuizSessionDocument = HydratedDocument<QuizSession>;

@Schema({ _id: false })
export class QuizAnswer {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  selectedOptionId: string;

  @Prop({ required: true })
  correctOptionId: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ default: 0 })
  scoreDelta: number;

  @Prop({ default: 0 })
  timeSpentSeconds: number;

  @Prop({ default: Date.now })
  answeredAt: Date;
}

const QuizAnswerSchema = SchemaFactory.createForClass(QuizAnswer);

@Schema({ timestamps: true })
export class QuizSession {
  @Prop({ default: () => generateId('session'), unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ enum: QuizMode, required: true, index: true })
  mode: QuizMode;

  @Prop({ default: null, index: true })
  buildingId: string | null;

  @Prop({ enum: SessionStatus, default: SessionStatus.Active, index: true })
  status: SessionStatus;

  @Prop({ type: [String], default: [] })
  questionIds: string[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  correctCount: number;

  @Prop({ default: 0 })
  incorrectCount: number;

  @Prop({ default: 0 })
  totalQuestions: number;

  @Prop({ default: null })
  timeLimitSeconds: number | null;

  @Prop({ default: Date.now, index: true })
  startedAt: Date;

  @Prop({ default: null })
  expiresAt: Date | null;

  @Prop({ default: null, index: true })
  finishedAt: Date | null;

  @Prop({ type: [QuizAnswerSchema], default: [] })
  answers: QuizAnswer[];

  createdAt: Date;
  updatedAt: Date;
}

export const QuizSessionSchema = SchemaFactory.createForClass(QuizSession);
