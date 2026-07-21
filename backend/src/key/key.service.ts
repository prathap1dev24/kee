import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { CreateKeyDto, UpdateKeyDto } from './dto/key.dto';

@Injectable()
export class KeyService {
  constructor(private readonly tenantService: TenantService) {}

  // SUPER ADMIN: Create Master Key (global catalog entry, shopId null)
  async createKey(dto: CreateKeyDto) {
    const existing = await this.tenantService.prisma.masterKey.findFirst({
      where: { shopId: null, keyNumber: dto.keyNumber },
    });
    if (existing) {
      throw new BadRequestException(`Key with blank number '${dto.keyNumber}' already exists in database`);
    }

    return this.tenantService.prisma.masterKey.create({
      data: dto,
    });
  }

  // SUPER ADMIN: Update Master Key
  async updateKey(id: string, dto: UpdateKeyDto) {
    const existing = await this.tenantService.prisma.masterKey.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Key blank not found');

    if (dto.keyNumber && dto.keyNumber !== existing.keyNumber) {
      const collision = await this.tenantService.prisma.masterKey.findFirst({
        where: { shopId: existing.shopId, keyNumber: dto.keyNumber, NOT: { id } },
      });
      if (collision) {
        throw new BadRequestException(`Key with blank number '${dto.keyNumber}' already exists`);
      }
    }

    return this.tenantService.prisma.masterKey.update({
      where: { id },
      data: dto,
    });
  }

  // SUPER ADMIN: Delete Master Key
  async deleteKey(id: string) {
    const existing = await this.tenantService.prisma.masterKey.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Key blank not found');

    return this.tenantService.prisma.masterKey.delete({ where: { id } });
  }

  // SUPER ADMIN: List/Search Keys across ALL shops (Query filters based on brand, category, keyNumber)
  async getKeys(search?: string) {
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { keyNumber: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { blankNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.tenantService.prisma.masterKey.findMany({
      where: whereClause,
      orderBy: { keyNumber: 'asc' },
      include: { shop: { select: { id: true, name: true } } },
    });
  }

  // SHOP ADMIN: List/Search Keys created within their own shop only
  async getShopKeys(shopId: string, search?: string) {
    const whereClause: any = { shopId };
    if (search) {
      whereClause.OR = [
        { keyNumber: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { blankNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.tenantService.prisma.masterKey.findMany({
      where: whereClause,
      orderBy: { keyNumber: 'asc' },
    });
  }

  // SHARED: Get Key by ID
  async getKeyById(id: string) {
    const key = await this.tenantService.prisma.masterKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException('Key blank not found');
    return key;
  }
}
