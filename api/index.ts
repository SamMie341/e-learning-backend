import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

// สร้างฟังก์ชันสำหรับบูตแอป
async function createServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  await app.init();
}

// ตัวแปรเก็บสถานะว่าแอปตื่นหรือยัง
let cachedServer = false;

export default async (req: any, res: any) => {
  if (!cachedServer) {
    await createServer();
    cachedServer = true;
  }
  return server(req, res);
};