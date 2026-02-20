import { Injectable, UnauthorizedException } from "@nestjs/common";
import { IAuthProvider } from "src/auth/domain/ports/auth-provider.port";
import {JwtService} from "@nestjs/jwt";
import { LoginRequestDto } from "../dtos/login-request.dto";
import { ILoginLogger } from "src/auth/domain/ports/login-logger.port";
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
        const extUser = await this.authProvider.authenticate(dto.username!, dto.password!);
        try {
        if(!extUser){
            await this.loginLogger.log(
                dto.username!, 
                'N/A', 
                'FAILED', 
                meta.ip, 
                meta.userAgent, 
                'ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
            );
            throw new UnauthorizedException('ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ');
        }

        
            let localUser = await this.userRepo.findByUsername(extUser.username);

        
                localUser = await this.userRepo.createOrUpdate(extUser.username, extUser.fullname, 'student',
                    {
                        empImg: (extUser as any).empimg,
                        department: extUser.department,
                        division: (extUser as any).division,
                        unit: (extUser as any).unit,
                        status: (extUser as any).status,
                    }
                );


            await this.userRepo.updateLastLogin(localUser!.id);

            const mySystemRole = localUser?.role.name;

            await this.loginLogger.log(dto.username!, extUser.fullname, 'SUCCESS', meta.ip, meta.userAgent, 'ເຂົ້າສູ່ລະບົບສຳເລັດ')

            const payload = {
                sub: localUser!.id,
                username: localUser!.username,
                role: mySystemRole,
                dept: extUser.department,
                empimg: extUser.empimg,
                division: extUser.division,
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: localUser!.id,
                    username: localUser!.username,
                    fullname: localUser!.fullname,
                    email: extUser.email,
                    empImg: extUser.empimg,
                    department: extUser.department,
                    division: extUser.division,
                    unit: extUser.unit,
                    role: mySystemRole,
                    status: localUser.status,
                },
                external_token: extUser.externalToken
            };
        } catch (error) {
            await this.loginLogger.log(
                dto.username!, 
                extUser?.fullname || 'N/A', 
                'FAILED', 
                meta.ip, 
                meta.userAgent, 
                error instanceof Error ? error.message : 'Unknown error'
            );
            throw error;
        }
    }
}