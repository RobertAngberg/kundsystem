import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.activity.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByCustomer(customerId: number) {
    return this.prisma.activity.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createActivityDto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: createActivityDto,
      include: { customer: true },
    });
  }

  async delete(id: number) {
    return this.prisma.activity.delete({
      where: { id },
    });
  }
}
