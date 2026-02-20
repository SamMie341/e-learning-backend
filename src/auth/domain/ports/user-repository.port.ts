export interface LocalUser {
    id: number;
    username: string;
    fullname: string;
    empImg: string;
    department?: string;
    division?: string;
    unit?: string;
    status?: string;
    role: {
        name: string;
    };
}

export abstract class IUserRepository {
    abstract findByUsername(username: string): Promise<LocalUser | null>;
    abstract createOrUpdate(username: string, fullname: string, roleName?: string, extraData?: {
        empImg?: string; department?: string; division?: string; unit: string; status: string;
    }): Promise<LocalUser>;
    abstract updateLastLogin(id: number): Promise<void>;
}