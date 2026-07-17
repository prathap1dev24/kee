import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('super/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SuperCustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getCustomers(@Query('search') search?: string) {
    return this.customerService.getSuperCustomers(search);
  }

  @Get(':id')
  async getCustomerById(@Param('id') id: string) {
    return this.customerService.getSuperCustomerById(id);
  }

  @Put(':id')
  async updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateSuperCustomer(id, dto);
  }
}
