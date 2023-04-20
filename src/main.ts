import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readCredential, readCredentialValue } from './utils/credStore';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
  console.log(process.env.PORT);
  readCredential('backend', 'KEY', 'SAP_URL');
  readCredentialValue('backend', 'KEY', 'SAP_URL');
}
bootstrap();
