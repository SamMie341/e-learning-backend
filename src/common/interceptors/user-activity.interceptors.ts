import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) {}

   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(user && user.id){
            this.prisma.user.update({
                where: {id: user.id},
                data: {lastActiveAt: new Date()}
            }).catch(err => {
                console.error('Failed to update lastActiveAt', err);
            });
        }
        return next.handle();
    }
}