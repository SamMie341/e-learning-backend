import { AuthUser } from "../entities/auth-user.entity";

export abstract class IAuthProvider {
    abstract authenticate(username: string, password: string) : Promise<AuthUser | null>;
}