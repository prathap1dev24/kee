import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { PromotionType } from '@prisma/client';

export class CreatePromotionDto {
  @IsEnum(PromotionType)
  @IsNotEmpty({ message: 'Promotion type is required' })
  type: PromotionType;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  // Only meaningful for type === OFFER.
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  linkedPromotionId?: string;
}

export class UpdatePromotionDto {
  @IsEnum(PromotionType)
  @IsOptional()
  type?: PromotionType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  linkedPromotionId?: string;
}
