import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateKeyDto {
  @IsString()
  @IsNotEmpty({ message: 'Key blank number/code is required' })
  keyNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsString()
  @IsOptional()
  backImageUrl?: string;
}

export class UpdateKeyDto {
  @IsString()
  @IsOptional()
  keyNumber?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  backImageUrl?: string;
}
