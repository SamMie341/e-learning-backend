import { Injectable, UnauthorizedException } from "@nestjs/common";
import { IAuthProvider } from "src/auth/domain/ports/auth-provider.port";
import {JwtService} from "@nestjs/jwt";
import { LoginRequestDto } from "../dtos/login-request.dto";
import { ILoginLogger } from "src/auth/domain/ports/loggin-logger.port";
import { Role } from "src/common/enums/role.enum";
import { IUserRepository } from "src/auth/domain/ports/user-repository.port";

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly authProvider: IAuthProvider,
        private readonly jwtService: JwtService, 
        private readonly loginLogger: ILoginLogger,
        private readonly userRepo: IUserRepository,
    ){}

    async execute(dto: LoginRequestDto, meta: {ip: string, userAgent: string}) {
        const extUser = await this.authProvider.authenticate(dto.username, dto.password);
        try{

        if(!extUser){
            await this.loginLogger.log(dto.username,extUser!.fullname, 'FAILED', meta.ip, meta.userAgent, 'ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
            throw new UnauthorizedException('ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ');
        }

        let localUser = await this.userRepo.findByUsername(extUser.username);

        if(!localUser) {
            localUser = await this.userRepo.createOrUpdate(extUser.username, extUser.fullname, 'student');
        }

        const mySystemRole = localUser?.role.name;

        await this.loginLogger.log(dto.username,extUser.fullname, 'SUCCESS', meta.ip, meta.userAgent, 'ເຂົ້າສູ່ລະບົບສຳເລັດ')

        const payload = {
            sub: localUser!.id,
            username: localUser!.username,
            role: mySystemRole,
            dept: extUser.department,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: localUser!.id,
                username: localUser!.username,
                fullname: localUser!.fullname,
                email: extUser.email,
                department: extUser.department,
                role: mySystemRole,
            },
            external_token: extUser.externalToken
        };
        } catch (error) {
            if (!(error instanceof UnauthorizedException)) {
                await this.loginLogger.log(dto.username,extUser!.fullname, 'FAILED', meta.ip, meta.userAgent, error.message);
            }
            throw error;
        }
    }
}