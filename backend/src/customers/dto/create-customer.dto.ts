import { IsEmail, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @IsOptional()
  companyId?: number;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsInt()
  @IsOptional()
  teamId?: number;
}
