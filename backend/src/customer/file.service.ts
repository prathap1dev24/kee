import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService implements OnModuleInit {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads');

  onModuleInit() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(originalname: string, buffer: Buffer, shopId: string): Promise<{ fileUrl: string; fileKey: string }> {
    const fileExt = path.extname(originalname);
    const cleanShopId = shopId.replace(/[^a-zA-Z0-9]/g, '');
    const uniqueName = `${cleanShopId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${fileExt}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/api/uploads/${uniqueName}`;
    return { fileUrl, fileKey: uniqueName };
  }

  async deleteFile(fileKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileKey);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}
