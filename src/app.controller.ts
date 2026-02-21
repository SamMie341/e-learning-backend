import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Root') // จัดหมวดหมู่ในหน้า Swagger
@Controller()
export class AppController {
  
  // สร้าง Endpoint เริ่มต้นสำหรับตรวจสอบสถานะ API (Health Check)
  @Get()
  @ApiOperation({ summary: 'API Health Check' })
  getHello() {
    return {
      status: 'OK',
      message: 'E-Learning API is running successfully! 🚀',
      timestamp: new Date().toISOString(),
    };
  }
}