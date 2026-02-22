import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
// ✅ เปลี่ยนวิธี Import Express ให้เรียกใช้เป็นฟังก์ชันได้
import express from 'express'; 

const expressApp = express();
let isInitialized = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  
  // เปิด CORS เพื่อให้ Next.js ของเราดึงข้อมูลได้
  app.enableCors();
  
  await app.init();
  isInitialized = true;
}

// ✅ สร้างฟังก์ชัน Handler ให้ Vercel เรียกใช้
export default async function handler(req: any, res: any) {
  // ถ้าระบบยังไม่ตื่น ให้รอมันโหลด bootstrap() ให้เสร็จก่อน
  if (!isInitialized) {
    await bootstrap();
  }
  
  // พอโหลดเสร็จแล้ว ค่อยส่ง Request ให้ Express (NestJS) จัดการต่อ
  return expressApp(req, res);
}