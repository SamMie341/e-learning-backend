import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. 🌐 ເປີດໃຊ້ງານ CORS (ສຳຄັນຫຼາຍສຳລັບ Next.js ທີ່ຢູ່ຄົນລະ Domain)
  app.enableCors({
    origin: '*', // ໃນ Production ຄວນປ່ຽນເປັນ URL ຂອງ Next.js ເຊັ່ນ 'https://my-frontend.vercel.app'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. 🛡️ ເປີດໃຊ້ງານ Validation ກວດສອບຂໍ້ມູນ (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ຕັດຂໍ້ມູນທີ່ບໍ່ມີໃນ DTO ຖິ້ມ
      transform: true, // ແປງຊະນິດຂໍ້ມູນອັດຕະໂນມັດ (ເຊັ່ນ String ເປັນ Number)
    }),
  );

  // 3. 📚 ຕັ້ງຄ່າ Swagger API (ສຳລັບເບິ່ງ Document)
  const config = new DocumentBuilder()
    .setTitle('E-Learning API')
    .setDescription('The E-Learning API description')
    .setVersion('1.0')
    .addBearerAuth() // ເປີດໃຫ້ໃສ່ Token ໃນ Swagger ໄດ້
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 4. 🚀 ຕັ້ງຄ່າ Port ສຳລັບ Vercel
  // Vercel ຈະສົ່ງ PORT ມາໃຫ້ຜ່ານ Environment Variable, ຖ້າບໍ່ມີໃຫ້ໃຊ້ 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs at: http://localhost:${port}/api/docs`);
}

bootstrap();