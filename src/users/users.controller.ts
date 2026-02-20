import { Body, Controller, Get, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/presentation/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.id);
    }

    @Put('profile')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    updateProfile(
        @Request() req,
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File
    ){
        let imagePath: string | undefined = undefined;
        if(file) {
            imagePath = `/uploads/users/${file.filename}`;
        }

        return this.usersService.updateProfile(req.user.id, {
            fullname: body.fullname,
            departmentName: body.departmentName,
            empimg: imagePath
        });
    }
}
