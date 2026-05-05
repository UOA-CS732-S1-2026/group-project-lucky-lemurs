import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BuildingsModule } from './buildings/buildings.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { QuestionsModule } from './questions/questions.module';
import { QuizModule } from './quiz/quiz.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          'mongodb://127.0.0.1:27017/lucky-lemurs',
      }),
//       useFactory: (configService: ConfigService) => {
//   const uri =
//     configService.get<string>('MONGODB_URI') ??
//     'mongodb://127.0.0.1:27017/lucky-lemurs';

//   console.log('=== DEBUG ===');
//   console.log('MONGODB_URI exists:', !!uri);
//   console.log('MONGODB_URI value:', uri?.slice(0, 40));

//   return {
//     uri,
//   };
// },
    }),
    AuthModule,
    UsersModule,
    BuildingsModule,
    QuestionsModule,
    QuizModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
