import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { KeyStatus } from '@prisma/client';

export class CreateKeyDto {
  @IsString()
  @IsNotEmpty({ message: 'Key blank number/code is required' })
  keyNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Brand is required' })
  brand: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Blank number is required' })
  blankNumber: string;

  @IsString()
  @IsOptional()
  frontImageUrl?: string;

  @IsString()
  @IsOptional()
  backImageUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(KeyStatus)
  @IsOptional()
  status?: KeyStatus;
}

export class UpdateKeyDto {
  @IsString()
  @IsOptional()
  keyNumber?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  blankNumber?: string;

  @IsString()
  @IsOptional()
  frontImageUrl?: string;

  @IsString()
  @IsOptional()
  backImageUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(KeyStatus)
  @IsOptional()
  status?: KeyStatus;
}
