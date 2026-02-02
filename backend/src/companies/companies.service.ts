import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  // Hämta alla företag (endast användarens egen data)
  async findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      include: { customers: true },
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { customers: true },
    });

    if (!company) {
      throw new NotFoundException(`Företag med ID ${id} hittades inte`);
    }

    return company;
  }

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      return await this.prisma.company.create({
        data: createCompanyDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ett företag med detta organisationsnummer finns redan',
        );
      }
      throw error;
    }
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.company.delete({
      where: { id },
    });
  }
}
