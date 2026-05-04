import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const firstError = findFirstValidationError(errors);
        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: firstError.message,
          field: firstError.field,
        });
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

function findFirstValidationError(errors: ValidationError[]): {
  field: string;
  message: string;
} {
  const [error] = errors;
  if (!error) {
    return { field: 'unknown', message: 'Validation failed' };
  }

  if (error.constraints) {
    const [message] = Object.values(error.constraints);
    return { field: error.property, message };
  }

  if (error.children?.length) {
    return findFirstValidationError(error.children);
  }

  return { field: error.property, message: 'Validation failed' };
}
