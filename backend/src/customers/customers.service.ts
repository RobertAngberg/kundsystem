import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // Hämta alla kunder (endast användarens egen data)
  async findAll(userId: string) {
    console.log('findAll called with userId:', userId);
    const customers = await this.prisma.customer.findMany({
      where: { ownerId: userId },
      include: {
        company: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Found customers:', customers.length);
    return customers;
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
    try {
      const customer = await this.prisma.customer.create({
        data: createCustomerDto,
      });

      // Logga aktivitet
      await this.prisma.activityLog.create({
        data: {
          action: 'created',
          entityType: 'customer',
          entityId: customer.id,
          entityName: customer.name || customer.email,
        },
      });

      return customer;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'En kund med denna e-postadress finns redan',
        );
      }
      throw error;
    }
  }

  // Uppdatera kund
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    // Kolla om kunden finns först
    await this.findOne(id);

    const customer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });

    // Logga aktivitet
    await this.prisma.activityLog.create({
      data: {
        action: 'updated',
        entityType: 'customer',
        entityId: customer.id,
        entityName: customer.name || customer.email,
      },
    });

    return customer;
  }

  // Ta bort kund
  async remove(id: number) {
    // Kolla om kunden finns först
    const customer = await this.findOne(id);

    // Logga aktivitet innan borttagning
    await this.prisma.activityLog.create({
      data: {
        action: 'deleted',
        entityType: 'customer',
        entityId: customer.id,
        entityName: customer.name || customer.email,
      },
    });

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
