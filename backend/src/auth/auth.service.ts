import { Injectable, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from '../tenant/tenant.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { LoginDto, ChangePasswordDto, ResetPasswordPublicDto, RegisterShopDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import { PHONE_REGEX, PHONE_REGEX_MESSAGE } from '../common/validators/phone';
import { FileService } from '../customer/file.service';
import { persistShopDocuments } from '../common/shop-document.util';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly tenantService: TenantService,
    private readonly jwtService: JwtService,
    private readonly fileService: FileService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRecords();
  }

  private async seedDefaultRecords() {
    try {
      // Check if any Super Admin exists
      const superAdminCount = await this.tenantService.prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });

      if (superAdminCount === 0) {
        console.log('No Super Admin found. Auto-seeding default credentials...');
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('adminpassword', salt);

        await this.tenantService.prisma.user.create({
          data: {
            email: 'admin@kee.com',
            name: 'KEE Platform Administrator',
            passwordHash,
            role: Role.SUPER_ADMIN,
          },
        });
        console.log('Auto-seeded Super Admin: admin@kee.com / adminpassword');
        
        // Also create a demo Shop and Shop Admin
        const demoShop = await this.tenantService.prisma.shop.create({
          data: {
            name: 'Metro Duplicate Keys (Shop A)',
            themeColor: '#4CAF50',
            companyDetails: JSON.stringify({
              address: '123 Main St, New Delhi, India',
              gst: '07AAAAA1111A1Z1',
              phone: '+919999999999',
            }),
          },
        });

        const shopSalt = await bcrypt.genSalt(12);
        const shopPasswordHash = await bcrypt.hash('shoppassword', shopSalt);

        await this.tenantService.prisma.user.create({
          data: {
            email: 'shop@kee.com',
            name: 'Metro Key Shop Admin',
            passwordHash: shopPasswordHash,
            role: Role.SHOP_ADMIN,
            shopId: demoShop.id,
          },
        });

        // Set up subscription for Shop (the free trial plan has been retired -
        // demo/seeded shops now get a standard Monthly plan like any real signup)
        await this.tenantService.prisma.subscription.create({
          data: {
            shopId: demoShop.id,
            plan: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        console.log('Auto-seeded Demo Shop Admin: shop@kee.com / shoppassword');
      }
    } catch (err) {
      console.error('Error during auto-seeding:', err.message);
    }
  }

  async sendOtp(dto: { identifier: string, method: string, purpose?: string }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (dto.method === 'email' && !emailRegex.test(dto.identifier)) {
      throw new BadRequestException('Invalid email address format');
    }
    if (dto.method === 'phone' && !PHONE_REGEX.test(dto.identifier)) {
      throw new BadRequestException(PHONE_REGEX_MESSAGE);
    }

    if (dto.purpose === 'register') {
      if (dto.method === 'email') {
        const existing = await this.tenantService.prisma.user.findUnique({
          where: { email: dto.identifier },
        });
        if (existing) {
          throw new BadRequestException('Email address already registered to another user');
        }
      }
    }

    if (dto.purpose === 'reset') {
      if (dto.method === 'email') {
        const existing = await this.tenantService.prisma.user.findUnique({
          where: { email: dto.identifier },
        });
        if (!existing) {
          throw new BadRequestException('No registered account found with this email');
        }
      }
    }

    const otpCode = String(Math.floor(1000 + Math.random() * 9000));
    const purpose = dto.purpose || 'default';

    await this.tenantService.prisma.otpCode.updateMany({
      where: { identifier: dto.identifier, purpose, consumed: false },
      data: { consumed: true },
    });

    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(otpCode, salt);
    await this.tenantService.prisma.otpCode.create({
      data: {
        identifier: dto.identifier,
        method: dto.method,
        purpose,
        codeHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    let delivered = false;

    if (dto.method === 'email') {
      const host = process.env.SMTP_HOST || '';
      const user = process.env.SMTP_USER || '';
      const pass = process.env.SMTP_PASS || '';

      if (host && user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user, pass },
        });

        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"KEE Key Space Platform" <no-reply@kee.com>',
            to: dto.identifier,
            subject: 'KEE Secure Verification Code',
            text: `Your KEE verification code is: ${otpCode}`,
            html: `<h3>KEE Verification Code</h3><p>Your OTP code is: <strong>${otpCode}</strong></p>`,
          });
          delivered = true;
        } catch (err) {
          console.error('SMTP email send failed:', err.message);
        }
      }
    } else {
      const sid = process.env.TWILIO_ACCOUNT_SID || '';
      const token = process.env.TWILIO_AUTH_TOKEN || '';
      const fromPhone = process.env.TWILIO_PHONE_NUMBER || '';

      if (sid && token && fromPhone) {
        try {
          const twilio = require('twilio');
          const client = twilio(sid, token);
          await client.messages.create({
            body: `Your KEE OTP code is: ${otpCode}`,
            from: fromPhone,
            to: dto.identifier,
          });
          delivered = true;
        } catch (err) {
          console.error('Twilio SMS send failed:', err.message);
        }
      }
    }

    if (!delivered && process.env.NODE_ENV !== 'production') {
      console.log(`[OTP dev fallback] No ${dto.method} provider configured — code for ${dto.identifier}: ${otpCode}`);
    }

    // Dev/demo convenience only: surface the code in the API response so it can be
    // logged to the browser console. Never included when a real provider delivered it,
    // and never included in production.
    const devCode = (!delivered && process.env.NODE_ENV !== 'production') ? otpCode : undefined;

    return { success: true, delivered, ...(devCode ? { devCode } : {}) };
  }

  async verifyOtp(dto: { identifier: string, method: string, purpose?: string, code: string }) {
    const purpose = dto.purpose || 'default';

    const record = await this.tenantService.prisma.otpCode.findFirst({
      where: { identifier: dto.identifier, purpose, consumed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('No pending OTP found. Please request a new code.');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired. Please request a new code.');
    }

    const isMatch = await bcrypt.compare(dto.code, record.codeHash);
    if (!isMatch) {
      throw new BadRequestException('Incorrect OTP code. Please try again.');
    }

    await this.tenantService.prisma.otpCode.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    return { success: true };
  }

  async login(loginDto: LoginDto) {
    const user = await this.tenantService.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify tenant is active if SHOP_ADMIN
    if (user.role === Role.SHOP_ADMIN && user.shopId) {
      const shop = await this.tenantService.prisma.shop.findUnique({
        where: { id: user.shopId },
      });
      if (!shop) {
        throw new UnauthorizedException('Your shop access has been suspended');
      }
      if (!shop.isActive) {
        throw new UnauthorizedException('Your shop access has been suspended');
      }
    }

    const payload = { sub: user.id, email: user.email, role: user.role, shopId: user.shopId };
    
    // Log activity
    await this.tenantService.prisma.activityLog.create({
      data: {
        userId: user.id,
        shopId: user.shopId,
        action: 'LOGIN',
        details: JSON.stringify({ email: user.email, name: user.name }),
      },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.tenantService.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password input is incorrect');
    }

    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.tenantService.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Log activity
    await this.tenantService.prisma.activityLog.create({
      data: {
        userId: user.id,
        shopId: user.shopId,
        action: 'CHANGE_PASSWORD',
        details: JSON.stringify({ message: 'Password updated successfully' }),
      },
    });

    return { success: true, message: 'Password updated successfully' };
  }

  async resetPasswordPublic(dto: ResetPasswordPublicDto) {
    let user;
    if (dto.method === 'email') {
      user = await this.tenantService.prisma.user.findUnique({
        where: { email: dto.identifier },
      });
    } else {
      // Find shop by matching phone number in companyDetails
      const shops = await this.tenantService.prisma.shop.findMany();
      const matchingShop = shops.find(s => {
        try {
          const details = JSON.parse(s.companyDetails || '{}');
          return details.phone && details.phone.replace(/\s+/g, '') === dto.identifier.replace(/\s+/g, '');
        } catch (e) {
          return false;
        }
      });
      if (matchingShop) {
        user = await this.tenantService.prisma.user.findFirst({
          where: { shopId: matchingShop.id },
        });
      }
    }

    if (!user) {
      throw new BadRequestException(`No active profile registered with this ${dto.method}`);
    }

    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.tenantService.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Log activity
    await this.tenantService.prisma.activityLog.create({
      data: {
        userId: user.id,
        shopId: user.shopId,
        action: 'RESET_PASSWORD_PUBLIC',
        details: JSON.stringify({ message: `Password reset successfully via public ${dto.method} recovery` }),
      },
    });

    return { success: true, message: 'Password reset successfully' };
  }

  async registerShop(dto: RegisterShopDto) {
    const existingUser = await this.tenantService.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email address already registered to another user');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.tenantService.prisma.$transaction(async (tx) => {
      // 1. Create Shop, automatically active - no manual Super Admin approval
      // step is required before a shop can log in and start using the platform.
      const shop = await tx.shop.create({
        data: {
          name: dto.shopName,
          themeColor: '#8C24FF',
          isActive: true,
          // NOTE: shopPhoto/shopLicense/ownerAadhaar are NOT stored here anymore -
          // they're persisted as real files + ShopDocument rows below (see
          // persistShopDocuments). companyDetails now only holds free-text
          // contact/registration fields.
          companyDetails: JSON.stringify({
            address: dto.location || 'Pending registration details',
            gst: 'Pending',
            phone: dto.phone,
            whatsappNumber: dto.whatsappNumber || '',
          }),
        },
      });

      // 1b. Persist uploaded documents (shop photo, shop license, owner Aadhaar)
      // as ShopDocument rows instead of embedding base64 in companyDetails.
      await persistShopDocuments(this.fileService, tx, shop.id, {
        shopPhoto: dto.shopPhoto,
        shopLicense: dto.shopLicense,
        ownerAadhaar: dto.ownerAadhaar,
      });

      // 2. Create User
      await tx.user.create({
        data: {
          email: dto.email,
          name: dto.ownerName,
          passwordHash,
          role: Role.SHOP_ADMIN,
          shopId: shop.id,
        },
      });

      // 3. Create Subscription
      let durationDays = 7;
      if (dto.plan === 'MONTHLY') durationDays = 30;
      else if (dto.plan === 'HALF_YEARLY') durationDays = 180;
      else if (dto.plan === 'YEARLY') durationDays = 365;

      await tx.subscription.create({
        data: {
          shopId: shop.id,
          plan: dto.plan as any,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        },
      });

      // 4. Notify Super Admin of the new shop (informational only - no action required)
      await tx.notification.create({
        data: {
          title: 'New Shop Registered',
          message: `Shop "${dto.shopName}" by ${dto.ownerName} has registered and is now active. Tier: ${dto.plan}`,
          type: 'SHOP_REGISTRATION',
          shopId: null, // no specific shop's notification feed
          audience: 'SUPER_ADMIN', // internal to the Super Admin panel only - must NOT reach shop admins
        },
      });

      return { success: true, shopId: shop.id, message: 'Registration successful! Your shop account is now active - you can log in right away.' };
    });
  }
}
