import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
    }>;
    me(user: any): {
        user: any;
    };
    meInOrg(user: any): {
        user: any;
        note: string;
    };
}
