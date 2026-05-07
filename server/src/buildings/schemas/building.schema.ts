import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateId } from '../../common/id.util';

export type BuildingDocument = HydratedDocument<Building>;

@Schema({ _id: false })
export class BuildingReviewItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: '' })
  details: string;
}

const BuildingReviewItemSchema =
  SchemaFactory.createForClass(BuildingReviewItem);

@Schema({ timestamps: true })
export class Building {
  @Prop({ default: () => generateId('building'), unique: true, index: true })
  id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  shortName: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  location: string;

  @Prop({ type: String, default: null })
  imageUrl: string | null;

  @Prop({ type: [String], default: [] })
  reviewImageUrls: string[];

  @Prop({ default: 1 })
  unlockOrder: number;

  @Prop({ default: 5 })
  completionCoinReward: number;

  @Prop({ type: [BuildingReviewItemSchema], default: [] })
  reviewItems: BuildingReviewItem[];

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);
