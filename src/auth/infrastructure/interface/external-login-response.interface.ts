export interface ExternalLoginResponse {
    user:{
        id: number;
        username: string;
        employee_code: string;
        role: string;
        employee: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            empimg: string;
            department?: {
                id: number;
                department_name: string;
            };
            division?: {
                id: number;
                division_name: string;
            };
        };
    };
    token: string;
}