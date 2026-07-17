import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { CreateProductDto, UpdateProductDto, CreateOrderDto } from './dto/product.dto';
import { KeyStatus } from '@prisma/client';
import { getTenantContext } from '../tenant/tenant.context';

@Injectable()
export class ProductService {
  constructor(private readonly tenantService: TenantService) {}

  // ==========================================
  // PRODUCT MANAGEMENT
  // ==========================================

  async createProduct(dto: CreateProductDto) {
    const data: any = { ...dto };
    const price = Number(dto.price);
    const disc = Number(dto.discountPercentage || 0);
    data.offerPrice = disc > 0 ? price * (1 - disc / 100) : price;
    return this.tenantService.prisma.product.create({
      data,
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.tenantService.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    const data: any = { ...dto };
    const price = Number(dto.price !== undefined ? dto.price : existing.price);
    const disc = Number(dto.discountPercentage !== undefined ? dto.discountPercentage : existing.discountPercentage);
    data.offerPrice = disc > 0 ? price * (1 - disc / 100) : price;

    return this.tenantService.prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    const existing = await this.tenantService.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    // Prevent deletion if the product is in order items
    const orderItemCount = await this.tenantService.prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderItemCount > 0) {
      // Soft-delete by setting status to INACTIVE instead
      return this.tenantService.prisma.product.update({
        where: { id },
        data: { status: KeyStatus.INACTIVE },
      });
    }

    return this.tenantService.prisma.product.delete({ where: { id } });
  }

  async getProducts(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.status = KeyStatus.ACTIVE;
    }
    return this.tenantService.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.tenantService.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ==========================================
  // ORDERING WORKFLOW
  // ==========================================

  async checkoutOrder(shopId: string, dto: CreateOrderDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Run order placement in transaction to handle stock changes atomic
    return this.tenantService.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const itemsToCreate = [];

      for (const item of dto.items) {
        // Fetch product
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.status === KeyStatus.INACTIVE) {
          throw new NotFoundException(`Product ${item.productId} is not available`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product '${product.name}'. Available: ${product.stock}`);
        }

        // Decrement product stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        const itemPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
        totalAmount += itemPrice * item.quantity;

        itemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          shopId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Create log audit
      await tx.activityLog.create({
        data: {
          userId: getTenantContext()?.userId,
          shopId,
          action: 'ORDER_CREATE',
          details: JSON.stringify({ orderId: order.id, totalAmount }),
        },
      });

      return order;
    });
  }

  async getShopOrders(shopId: string) {
    return this.tenantService.prisma.order.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  async getSuperOrders() {
    return this.tenantService.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        shop: {
          select: { name: true },
        },
        items: {
          include: { product: true },
        },
      },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const existing = await this.tenantService.prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new NotFoundException('Order not found');

    const updated = await this.tenantService.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Notify the shop if status changes
    await this.tenantService.prisma.notification.create({
      data: {
        shopId: existing.shopId,
        title: `Order Status Update`,
        message: `Your order for duplicate key accessories has been updated to: ${status}`,
        type: 'ORDER_STATUS',
      },
    });

    return updated;
  }
}
