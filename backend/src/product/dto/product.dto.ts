import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than zero' })
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsInt()
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsNumber()
  @IsOptional()
  offerPrice?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsEnum(KeyStatus)
  @IsOptional()
  status?: KeyStatus;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsNumber()
  @IsOptional()
  offerPrice?: number;
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Order must contain items' })
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // PENDING, DISPATCHED, DELIVERED, CANCELLED
}
