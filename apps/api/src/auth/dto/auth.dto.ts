import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ValidateIf((value: RegisterDto) => !value.phone)
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email?: string;

  @ValidateIf((value: RegisterDto) => !value.email)
  @Matches(/^(?:0\d{9,10})$/)
  @Transform(({ value }: { value: string }) => value.replace(/\D/g, ''))
  phone?: string;

  @IsString()
  @Length(8, 72)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}

export class LoginDto {
  @IsString()
  identifier!: string;

  @IsString()
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class UpdateMeDto {
  @IsOptional() @IsString() @MaxLength(50) nickname?: string;
  @IsOptional() @IsString() @MaxLength(500) avatarUrl?: string;
}
