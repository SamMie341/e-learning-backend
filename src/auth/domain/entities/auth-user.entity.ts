export class AuthUser {
    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly fullname: string,
        public readonly email: string,
        public readonly empimg: string,
        public readonly department: string,
        public readonly division: string,
        public readonly unit: string,
        public readonly role: string,
        public readonly externalToken: string,
    ) {}
}