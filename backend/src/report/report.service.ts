import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class ReportService {
  constructor(private readonly tenantService: TenantService) {}

  // ==========================================
  // SUPER ADMIN DASHBOARD
  // ==========================================
  async getSuperDashboard() {
    const totalShops = await this.tenantService.prisma.shop.count();
    const activeShops = await this.tenantService.prisma.shop.count({ where: { isActive: true } });
    const inactiveShops = totalShops - activeShops;

    const totalCustomers = await this.tenantService.prisma.customer.count();
    const totalDocuments = await this.tenantService.prisma.customerDocument.count();

    // Sum of storageUsed across all shops
    const shopsStorage = await this.tenantService.prisma.shop.aggregate({
      _sum: {
        storageUsed: true,
      },
    });
    const totalStorageBytes = Number(shopsStorage._sum.storageUsed || 0);

    // Platform-wide popular keys: Group by keyNumber in Customer
    const popularKeysRaw = await this.tenantService.prisma.customer.groupBy({
      by: ['keyNumber'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });
    const popularKeys = popularKeysRaw.map(item => ({
      keyNumber: item.keyNumber,
      count: item._count.id,
    }));

    // Subscriptions nearing expiry (ends in next 10 days)
    const now = new Date();
    const in10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const expiringSubscriptions = await this.tenantService.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: in10Days,
        },
      },
      include: {
        shop: {
          select: { name: true },
        },
      },
    });

    // Recent revenue records
    const recentRevenue = await this.tenantService.prisma.revenueRecord.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      take: 6,
    });

    // Compute total subscription revenue
    const allSubscriptions = await this.tenantService.prisma.subscription.findMany();
    const subscriptionTotal = allSubscriptions.reduce((acc, sub) => {
      if (sub.plan === 'MONTHLY') return acc + 49;
      if (sub.plan === 'HALF_YEARLY') return acc + 269;
      if (sub.plan === 'YEARLY') return acc + 499;
      return acc;
    }, 0);

    return {
      shops: {
        total: totalShops,
        active: activeShops,
        inactive: inactiveShops,
      },
      stats: {
        customers: totalCustomers,
        documents: totalDocuments,
        storageUsed: totalStorageBytes,
      },
      popularKeys,
      expiringSubscriptions: expiringSubscriptions.map(s => ({
        id: s.id,
        shopId: s.shopId,
        shopName: s.shop.name,
        plan: s.plan,
        endDate: s.endDate,
      })),
      revenue: recentRevenue,
      subscriptionRevenue: subscriptionTotal,
    };
  }

  // Log manual revenue record
  async logRevenue(month: number, year: number, amount: number, notes?: string) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    const existing = await this.tenantService.prisma.revenueRecord.findFirst({
      where: { month, year },
    });

    if (existing) {
      return this.tenantService.prisma.revenueRecord.update({
        where: { id: existing.id },
        data: { amount, notes },
      });
    }

    return this.tenantService.prisma.revenueRecord.create({
      data: { month, year, amount, notes },
    });
  }

  // Get all revenue records
  async getRevenueRecords() {
    return this.tenantService.prisma.revenueRecord.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });
  }

  // ==========================================
  // SHOP ADMIN DASHBOARD
  // ==========================================
  async getShopDashboard(shopId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's registered customers
    const todayCustomers = await this.tenantService.prisma.customer.count({
      where: {
        shopId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Total registered customers
    const totalCustomers = await this.tenantService.prisma.customer.count({
      where: { shopId },
    });

    // Recent customers (last 5)
    const recentCustomers = await this.tenantService.prisma.customer.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Popular keys in this specific shop
    const popularKeysRaw = await this.tenantService.prisma.customer.groupBy({
      by: ['keyNumber'],
      where: { shopId },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });
    const popularKeys = popularKeysRaw.map(item => ({
      keyNumber: item.keyNumber,
      count: item._count.id,
    }));

    // Subscription status
    const subscription = await this.tenantService.prisma.subscription.findFirst({
      where: { shopId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    let daysRemaining = 0;
    if (subscription) {
      const diffTime = subscription.endDate.getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const customersForGraph = await this.tenantService.prisma.customer.findMany({
      where: {
        shopId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    });

    const monthlyCounts: { [monthStr: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyCounts[mName] = 0;
    }

    customersForGraph.forEach(c => {
      const mName = c.createdAt.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyCounts[mName] !== undefined) {
        monthlyCounts[mName]++;
      }
    });

    const monthlyStats = Object.keys(monthlyCounts).map(month => ({
      month,
      count: monthlyCounts[month],
    }));

    return {
      todayCustomers,
      totalCustomers,
      recentCustomers: recentCustomers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        keyNumber: c.keyNumber,
        vehicleNumber: c.vehicleNumber || null,
        capturedAddress: c.capturedAddress || null,
        createdAt: c.createdAt,
      })),
      popularKeys,
      monthlyStats,
      subscription: subscription ? {
        plan: subscription.plan,
        endDate: subscription.endDate,
        daysRemaining,
        status: subscription.status,
      } : null,
    };
  }

  // ==========================================
  // SHOP ADMIN REPORTS DATA
  // ==========================================
  async getShopReport(shopId: string, startDate?: string, endDate?: string) {
    const whereClause: any = { shopId };
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const customers = await this.tenantService.prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      include: { documents: { where: { deletedAt: null } } },
    });

    // Grouping by date for analytics charts
    const dateGroups: { [key: string]: number } = {};
    const keyGroups: { [key: string]: number } = {};

    customers.forEach(c => {
      const dateStr = c.createdAt.toISOString().split('T')[0];
      dateGroups[dateStr] = (dateGroups[dateStr] || 0) + 1;
      keyGroups[c.keyNumber] = (keyGroups[c.keyNumber] || 0) + 1;
    });

    const dailyStats = Object.keys(dateGroups).map(date => ({
      date,
      count: dateGroups[date],
    }));

    const keyStats = Object.keys(keyGroups).map(keyNumber => ({
      keyNumber,
      count: keyGroups[keyNumber],
    }));

    return {
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        keyNumber: c.keyNumber,
        reason: c.reason,
        idProofType: c.idProofType,
        hasPhoto: !!c.photoUrl,
        hasSignature: !!c.signatureUrl,
        documentsCount: c.documents.length,
        createdAt: c.createdAt,
      })),
      dailyStats,
      keyStats,
    };
  }

  getSupportConfig() {
    const filePath = 'C:/Users/prath/.gemini/antigravity/scratch/kee/backend/support_config.json';
    try {
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      console.warn('Failed to read support config file, using fallback defaults:', e);
    }
    return {
      whatsapp: '+91 98765 43210',
      careerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      keyMakingUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    };
  }

  updateSupportConfig(dto: { whatsapp: string; careerUrl: string; keyMakingUrl: string }) {
    const filePath = 'C:/Users/prath/.gemini/antigravity/scratch/kee/backend/support_config.json';
    try {
      const fs = require('fs');
      fs.writeFileSync(filePath, JSON.stringify(dto, null, 2), 'utf8');
      return dto;
    } catch (e) {
      throw new Error('Failed to save support configuration: ' + e.message);
    }
  }
}
