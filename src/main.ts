import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { fetchKey } from './utils/credStore';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
  console.log(process.env.PORT);
  fetchKey();
}
bootstrap();
