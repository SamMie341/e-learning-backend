export abstract class ILoginLogger {
    abstract log(
        username: string,
        fullname: string,
        status: 'SUCCESS' | 'FAILED',
        ip: string,
        userAgent: string,
        message?: string
    ): Promise<void>;
}