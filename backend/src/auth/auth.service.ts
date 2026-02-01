import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createProfile(createProfileDto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: createProfileDto,
    });
  }

  async findProfile(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async findAllProfiles() {
    return this.prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id },
      data: updateProfileDto,
    });
  }

  async deleteProfile(id: string) {
    return this.prisma.profile.delete({
      where: { id },
    });
  }
}
