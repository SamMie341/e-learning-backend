import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginRequestDto } from "src/auth/application/dto/login-request.dto";
import { LoginUseCase } from "src/auth/application/use-cases/login.use-case";

@ApiTags('Authentication')
@Controller('/auth')
export class AuthController { 
    constructor(private readonly loginUseCase: LoginUseCase){}

    @Post('/login')
    @ApiOperation({summary: 'ເຂົ້າສູ່ລະບົບຜ່ານ E-Office'})
    @ApiResponse({status: 200, description: 'ຂໍ້ມູນ Token ແລະ ຂໍ້ມູນຜູ້ໃຊ້'})
    @ApiResponse({status: 401, description:'ບໍ່ໄດ້ຮັບອະນຸຍາດ'})
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginRequestDto, @Ip() ip: string, @Headers('user-agent') userAgent: string){
        return this.loginUseCase.execute(dto, {ip,userAgent});
    }
}