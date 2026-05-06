import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { QuestionCategory, QuestionDifficulty } from '../../common/enums';
import { generateId } from '../../common/id.util';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ _id: false })
export class QuestionOption {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;
}

const QuestionOptionSchema = SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: true })
export class Question {
  @Prop({ default: () => generateId('q'), unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  buildingId: string;

  @Prop({ type: String, enum: QuestionCategory, required: true })
  category: QuestionCategory;

  @Prop({ type: String, enum: QuestionDifficulty, required: true })
  difficulty: QuestionDifficulty;

  @Prop({ required: true })
  questionText: string;

  @Prop({ type: [QuestionOptionSchema], required: true })
  options: QuestionOption[];

  @Prop({ required: true })
  correctOptionId: string;

  @Prop({ default: '' })
  explanation: string;

  @Prop({ default: '' })
  hintText: string;

  @Prop({ type: String, default: null })
  imageUrl: string | null;

  @Prop({ type: String, default: null })
  sourceUrl: string | null;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
