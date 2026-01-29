import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // Hämta alla kunder
  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Hämta en kund via ID
  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Kund med ID ${id} hittades inte`);
    }

    return customer;
  }

  // Skapa ny kund
  async create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  // Uppdatera kund
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    // Kolla om kunden finns först
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  // Ta bort kund
  async remove(id: number) {
    // Kolla om kunden finns först
    await this.findOne(id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
