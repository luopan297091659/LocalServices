export declare class RegisterDto {
    email?: string;
    phone?: string;
    password: string;
    nickname?: string;
}
export declare class LoginDto {
    identifier: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class UpdateMeDto {
    nickname?: string;
    avatarUrl?: string;
}
