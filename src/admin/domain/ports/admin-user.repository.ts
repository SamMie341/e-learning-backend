import { User } from "@prisma/client";

export interface FindUserOptions {
    page: number;
    limit: number;
    search?: string;
}

export abstract class IAdminUserRepository {
    abstract findAll(options: FindUserOptions) : Promise<{users: User[]; total: number}>;
    abstract findById(userId: number) : Promise<User | null>;
    abstract updateRole(userId: number, roleId: number): Promise<User>;
}