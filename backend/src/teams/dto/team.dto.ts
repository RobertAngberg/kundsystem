import { IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug får bara innehålla små bokstäver, siffror och bindestreck',
  })
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTeamDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string; // "admin", "sales", "viewer"
}
