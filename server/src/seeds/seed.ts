import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Building } from '../buildings/schemas/building.schema';
import { Question } from '../questions/schemas/question.schema';

async function readSeedFile<T>(fileName: string): Promise<T[]> {
  const filePath = join(process.cwd(), 'src', 'seeds', fileName);
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content) as T[];
}

async function upsertById<T extends { id: string }>(
  model: Model<T>,
  items: T[],
): Promise<void> {
  for (const item of items) {
    await model.updateOne({ id: item.id }, { $set: item }, { upsert: true });
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const buildingModel = app.get<Model<Building>>(getModelToken(Building.name));
  const questionModel = app.get<Model<Question>>(getModelToken(Question.name));

  const buildings = await readSeedFile<Building>('buildings.seed.json');
  const questions = await readSeedFile<Question>('questions.seed.json');

  await upsertById(buildingModel, buildings);
  await upsertById(questionModel, questions);

  console.log(
    `Seeded ${buildings.length} buildings and ${questions.length} questions.`,
  );
  await app.close();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
