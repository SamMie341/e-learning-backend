import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let cachedServer = false;

async function createServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  await app.init();
}

export default async (req: any, res: any) => {
  // 🚨 ทางลัด: ถ้าเรียก URL /ping ให้ตอบกลับทันทีโดยไม่ต้องรอ NestJS โหลด
  if (req.url === '/ping' || req.path === '/ping') {
    return res.status(200).json({ message: 'Vercel is Alive!' });
  }

  try {
    if (!cachedServer) {
      await createServer();
      cachedServer = true;
    }
    return server(req, res);
  } catch (error) {
    // ดักจับ Error เผื่อ NestJS แครช
    console.error('NestJS Crash:', error);
    return res.status(500).json({ error: 'NestJS Server Error' });
  }
};