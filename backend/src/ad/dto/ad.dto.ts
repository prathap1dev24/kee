import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsArray, IsDateString } from 'class-validator';
import { AdType } from '@prisma/client';

export class CreateAdDto {
  @IsString()
  @IsNotEmpty({ message: 'Advertisement title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Creative banner image url is required' })
  imageUrl: string;

  @IsEnum(AdType)
  @IsNotEmpty({ message: 'Ad Type is required' })
  type: AdType;

  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  targetAll?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetShops?: string[];
}

export class UpdateAdDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(AdType)
  @IsOptional()
  type?: AdType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  targetAll?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetShops?: string[];
}
