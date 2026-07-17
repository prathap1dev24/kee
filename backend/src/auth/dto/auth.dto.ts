import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { PHONE_REGEX, PHONE_REGEX_MESSAGE } from '../../common/validators/phone';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

export class ResetPasswordPublicDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  method: string; // 'email' | 'phone'

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  method: string; // 'email' | 'phone'

  @IsString()
  @IsNotEmpty()
  purpose: string; // 'register' | 'reset' | 'customer_verify' etc.
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  code: string;
}

export class RegisterShopDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_REGEX, { message: PHONE_REGEX_MESSAGE })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  plan: string; // 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY' (the free trial plan has been retired)

  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_REGEX, { message: PHONE_REGEX_MESSAGE })
  whatsappNumber: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  shopPhoto?: string;

  @IsOptional()
  @IsString()
  shopLicense?: string;

  @IsOptional()
  @IsString()
  ownerAadhaar?: string;
}
