import { NotFoundException } from '@nestjs/common';
import { ShopService } from './shop.service';

describe('ShopService', () => {
  let service: ShopService;
  let prismaMock: any;
  let tenantServiceMock: any;
  let fileServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      shop: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), create: jest.fn() },
      shopDocument: { deleteMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
      user: { findUnique: jest.fn(), create: jest.fn() },
      subscription: { create: jest.fn(), updateMany: jest.fn() },
      $transaction: jest.fn(async (cb: any) => cb(prismaMock)),
    };

    tenantServiceMock = { prisma: prismaMock };
    fileServiceMock = { uploadFile: jest.fn() };

    service = new ShopService(tenantServiceMock, fileServiceMock);
  });

  describe('addOrReplaceShopDocument', () => {
    it('throws NotFoundException when the shop does not exist', async () => {
      prismaMock.shop.findUnique.mockResolvedValue(null);

      await expect(
        service.addOrReplaceShopDocument('missing-shop', 'SHOP_PHOTO', { originalname: 'a.png', buffer: Buffer.from('x'), size: 1 }),
      ).rejects.toThrow(NotFoundException);

      expect(fileServiceMock.uploadFile).not.toHaveBeenCalled();
    });

    it('soft-deletes any existing active document of the same type before creating the new one', async () => {
      prismaMock.shop.findUnique.mockResolvedValue({ id: 'shop-1' });
      fileServiceMock.uploadFile.mockResolvedValue({ fileUrl: '/api/uploads/new.png', fileKey: 'new.png' });
      prismaMock.shopDocument.create.mockResolvedValue({ id: 'doc-2', documentType: 'SHOP_PHOTO' });

      const file = { originalname: 'photo.png', buffer: Buffer.from('data'), size: 4 };
      const result = await service.addOrReplaceShopDocument('shop-1', 'SHOP_PHOTO', file);

      // deleteMany (soft delete via the extension) must run BEFORE the new upload/create.
      expect(prismaMock.shopDocument.deleteMany).toHaveBeenCalledWith({
        where: { shopId: 'shop-1', documentType: 'SHOP_PHOTO' },
      });
      const deleteOrder = prismaMock.shopDocument.deleteMany.mock.invocationCallOrder[0];
      const createOrder = prismaMock.shopDocument.create.mock.invocationCallOrder[0];
      expect(deleteOrder).toBeLessThan(createOrder);

      expect(fileServiceMock.uploadFile).toHaveBeenCalledWith('photo.png', file.buffer, 'shop-1');
      expect(prismaMock.shopDocument.create).toHaveBeenCalledWith({
        data: {
          shopId: 'shop-1',
          documentType: 'SHOP_PHOTO',
          fileUrl: '/api/uploads/new.png',
          fileKey: 'new.png',
          fileSize: 4,
        },
      });
      expect(result).toEqual({ id: 'doc-2', documentType: 'SHOP_PHOTO' });
    });
  });

  describe('deleteShopDocument', () => {
    it('throws NotFoundException when the document does not belong to the shop', async () => {
      prismaMock.shopDocument.findFirst.mockResolvedValue(null);

      await expect(service.deleteShopDocument('shop-1', 'doc-1')).rejects.toThrow(NotFoundException);
      expect(prismaMock.shopDocument.delete).not.toHaveBeenCalled();
    });

    it('soft-deletes the document row without touching the physical file', async () => {
      prismaMock.shopDocument.findFirst.mockResolvedValue({ id: 'doc-1', shopId: 'shop-1' });
      prismaMock.shopDocument.delete.mockResolvedValue({ id: 'doc-1' });

      const result = await service.deleteShopDocument('shop-1', 'doc-1');

      expect(prismaMock.shopDocument.findFirst).toHaveBeenCalledWith({ where: { id: 'doc-1', shopId: 'shop-1' } });
      expect(prismaMock.shopDocument.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
      expect(result).toEqual({ success: true });
    });

    it('scopes the lookup to the requesting shop, so it cannot delete another shop\'s document', async () => {
      // findFirst is called with shopId in the where clause - simulate the DB
      // correctly returning nothing for a cross-tenant id.
      prismaMock.shopDocument.findFirst.mockResolvedValue(null);

      await expect(service.deleteShopDocument('shop-A', 'doc-owned-by-shop-B')).rejects.toThrow(NotFoundException);
      expect(prismaMock.shopDocument.findFirst).toHaveBeenCalledWith({
        where: { id: 'doc-owned-by-shop-B', shopId: 'shop-A' },
      });
    });
  });

  describe('createShop', () => {
    it('persists uploaded verification documents inside the same transaction as shop/user/subscription creation', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null); // email not taken
      prismaMock.shop.create.mockResolvedValue({ id: 'new-shop' });
      fileServiceMock.uploadFile.mockResolvedValue({ fileUrl: '/api/uploads/x.png', fileKey: 'x.png' });

      const dto: any = {
        name: 'Test Shop',
        adminEmail: 'admin@test.com',
        adminName: 'Admin',
        adminPassword: 'secret123',
        plan: 'MONTHLY',
        endDate: new Date().toISOString(),
        shopPhoto:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      };

      const result = await service.createShop(dto);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.shop.create).toHaveBeenCalled();
      expect(fileServiceMock.uploadFile).toHaveBeenCalled();
      expect(prismaMock.shopDocument.create).toHaveBeenCalled();
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(prismaMock.subscription.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'new-shop' });
    });
  });

  describe('getShops / getShopById - active documents include', () => {
    it('getShops requests only non-soft-deleted documents, newest first', async () => {
      prismaMock.shop.findMany.mockResolvedValue([]);
      await service.getShops();

      const includeArg = prismaMock.shop.findMany.mock.calls[0][0].include;
      expect(includeArg.documents).toEqual({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('getShopById requests only non-soft-deleted documents and throws when not found', async () => {
      prismaMock.shop.findUnique.mockResolvedValue(null);
      await expect(service.getShopById('missing')).rejects.toThrow(NotFoundException);

      const includeArg = prismaMock.shop.findUnique.mock.calls[0][0].include;
      expect(includeArg.documents).toEqual({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
