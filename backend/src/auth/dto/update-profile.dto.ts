import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['admin', 'sales', 'viewer'])
  role?: 'admin' | 'sales' | 'viewer';

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
