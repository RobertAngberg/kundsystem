import { IsString, IsNotEmpty, IsIn, IsInt } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsIn(['call', 'email', 'meeting', 'note'])
  type: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  customerId: number;
}
