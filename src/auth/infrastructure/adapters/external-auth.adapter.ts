import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { IAuthProvider } from "src/auth/domain/ports/auth-provider.port";
import { HttpService } from "@nestjs/axios";
import { AuthUser } from "src/auth/domain/entities/auth-user.entity";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { ExternalLoginResponse } from "../interface/external-login-response.interface";

@Injectable()
export class ExternalAuthAdapter implements IAuthProvider {
    private readonly logger = new Logger(ExternalAuthAdapter.name);
    private readonly apiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiUrl = this.configService.get<string>('HRM_API_URL') ?? '';

        if (!this.apiUrl) {
            throw new Error('API URL ບໍ່ມີ');
        }
    }

    async authenticate(username: string, password: string): Promise<AuthUser | null> {
        this.logger.log(`Attempting to login to: ${this.apiUrl}`);
        if(!this.apiUrl){
            this.logger.error('CRITICAL: API_URL is undefined!');
            return null;
        }
        try {
            const response = await firstValueFrom(
                this.httpService.post<ExternalLoginResponse>(`${this.apiUrl}/api/login`, {
                    username: username,
                    password: password,
                }, { timeout: 30000 })
            );
            const data = response.data;
            if (!data || !data.user || !data.token) {
                throw new UnauthorizedException('ເຂົ້າສູ່ລະບົບລົ້ມເຫຼວ');
            }

            const u = data.user;
            const emp = u.employee;

            const fullName = `${emp.first_name} ${emp.last_name}`;

            return new AuthUser(
                u.id.toString(),
                u.username,
                fullName,
                emp.email,
                emp.department?.department_name || 'N/A',
                u.role,
                data.token
            );
        } catch (error) {
            this.logger.error('External Auth Failed:', error.message);
            return null;
        }
    }
}