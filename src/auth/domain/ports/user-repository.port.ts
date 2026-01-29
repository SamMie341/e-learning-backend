export interface LocalUser {
    id: number;
    username: string;
    fullname: string;
    role: {
        name: string;
    };
}

export abstract class IUserRepository {
    abstract findByUsername(username: string): Promise<LocalUser | null>;
    abstract createOrUpdate(username: string, fullname: string, roleName?: string);
}