import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, CreateOrderDto, UpdateOrderStatusDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ==========================================
  // SUPER ADMIN CRUD: PRODUCTS
  // ==========================================

  @Get('super/products')
  @Roles(Role.SUPER_ADMIN)
  async superGetProducts() {
    return this.productService.getProducts(true); // Include inactive
  }

  @Post('super/products')
  @Roles(Role.SUPER_ADMIN)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Put('super/products/:id')
  @Roles(Role.SUPER_ADMIN)
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete('super/products/:id')
  @Roles(Role.SUPER_ADMIN)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  // ==========================================
  // SUPER ADMIN MANAGEMENT: ORDERS
  // ==========================================

  @Get('super/orders')
  @Roles(Role.SUPER_ADMIN)
  async superGetOrders() {
    return this.productService.getSuperOrders();
  }

  @Put('super/orders/:id/status')
  @Roles(Role.SUPER_ADMIN)
  async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.productService.updateOrderStatus(id, dto.status);
  }

  // ==========================================
  // SHOP ADMIN ENDPOINTS: STORE & ORDERS
  // ==========================================

  @Get('shop/products')
  @Roles(Role.SHOP_ADMIN)
  async shopGetProducts() {
    return this.productService.getProducts(false); // Only active
  }

  @Post('shop/orders')
  @Roles(Role.SHOP_ADMIN)
  async shopCheckoutOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.productService.checkoutOrder(req.user.shopId, dto);
  }

  @Get('shop/orders')
  @Roles(Role.SHOP_ADMIN)
  async shopGetOrders(@Request() req) {
    return this.productService.getShopOrders(req.user.shopId);
  }
}
