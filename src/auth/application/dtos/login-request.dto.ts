import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from 'class-validator';

export class LoginRequestDto {
    @ApiProperty({example:"ລະຫັດພະນັກງານ", description: "ລະຫັດພະນັກງານ"})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({example:"ລະຫັດຜ່ານ", description: "ລະຫັດຜ່ານ"})
    @IsString()
    @IsNotEmpty()
    password: string;
}