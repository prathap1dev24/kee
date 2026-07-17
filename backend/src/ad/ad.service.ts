import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';

@Injectable()
export class AdService {
  constructor(private readonly tenantService: TenantService) {}

  // SUPER ADMIN: Create Ad
  async createAd(dto: CreateAdDto) {
    return this.tenantService.prisma.advertisement.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        priority: dto.priority || 0,
        targetAll: dto.targetAll ?? true,
        targetShops: dto.targetShops || [],
      },
    });
  }

  // SUPER ADMIN: Update Ad
  async updateAd(id: string, dto: UpdateAdDto) {
    const existing = await this.tenantService.prisma.advertisement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ad not found');

    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    return this.tenantService.prisma.advertisement.update({
      where: { id },
      data: updateData,
    });
  }

  // SUPER ADMIN: Delete Ad
  async deleteAd(id: string) {
    const existing = await this.tenantService.prisma.advertisement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ad not found');

    return this.tenantService.prisma.advertisement.delete({ where: { id } });
  }

  // SUPER ADMIN: List all ads
  async getAllAds() {
    return this.tenantService.prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // SHOP ADMIN: List targeted ads
  async getTargetedAds(shopId: string) {
    const now = new Date();
    // Fetch advertisements that are currently active
    const ads = await this.tenantService.prisma.advertisement.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { priority: 'desc' },
    });

    // Filter by targeting on application layer
    return ads.filter(ad => ad.targetAll || ad.targetShops.includes(shopId));
  }
}
