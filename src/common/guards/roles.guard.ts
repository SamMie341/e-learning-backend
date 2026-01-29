import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../enums/role.enum";
import { ROLE_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY,[
            context.getHandler(),
            context.getClass(),
        ]);

        if(!requiredRoles) {
            return true;
        }

        const {user} = context.switchToHttp().getRequest();

        if(!user || !user.role) {
            throw new UnauthorizedException("User role not found");
        }

        return requiredRoles.some((role) => user.role.toLowerCase() === role.toLowerCase())
    }
}