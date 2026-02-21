import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { IAuthProvider } from "../../domain/ports/auth-provider.port";
import { HttpService } from "@nestjs/axios";
import { AuthUser } from "../../domain/entities/auth-user.entity";
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
            const authUser = new AuthUser(
                u.id.toString(),
                u.username,
                fullName,
                emp.email,
                emp.empimg,
                emp.department?.department_name || 'N/A',
                emp.division?.division_name || 'N/A',
                emp.unit?.unit_name || 'N/A',
                u.role,
                data.token,
            );

            (authUser as any).empimg = emp.empimg || null;
            (authUser as any).division = emp.division?.division_name || null;
            (authUser as any).unit = emp.unit?.unit_name || null;
            (authUser as any).status = emp.status || 'active';

            return authUser;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('External Auth Failed:', errorMessage);
            return null;
        }
    }
}