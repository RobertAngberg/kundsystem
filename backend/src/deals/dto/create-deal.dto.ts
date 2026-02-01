import { IsNumber, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateDealDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  teamId?: number;
}
