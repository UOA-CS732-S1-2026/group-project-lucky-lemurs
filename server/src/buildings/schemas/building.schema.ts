import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateId } from '../../common/id.util';

export type BuildingDocument = HydratedDocument<Building>;

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

  @Prop({ default: null })
  imageUrl: string | null;

  @Prop({ default: 1 })
  unlockOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);
