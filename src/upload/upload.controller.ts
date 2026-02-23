import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import * as multer from 'multer';

@Controller('upload') // Endpoint จะเป็น /api/upload หรือ /upload
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    // 🚨 หัวใจสำคัญสำหรับ Vercel: เก็บไฟล์ไว้ใน RAM ชั่วคราว ห้ามใช้ diskStorage
    storage: multer.memoryStorage(), 
    limits: {
      fileSize: 4 * 1024 * 1024, // ล็อกขนาดไฟล์ไว้ที่ 4MB (กฎของ Vercel Free)
    },
    fileFilter: (req, file, cb) => {
      // ดักให้รับเฉพาะไฟล์รูปภาพเท่านั้น
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('อนุญาตให้อัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์ที่ต้องการอัปโหลด');
    }

    // เรียก Service ให้อัปโหลดไฟล์ไปไว้ในโฟลเดอร์ 'course-images' บน Supabase
    const result = await this.storageService.uploadFile(file, 'course-images');
    
    return {
      statusCode: 201,
      message: 'อัปโหลดรูปภาพสำเร็จ!',
      data: result,
    };
  }
}