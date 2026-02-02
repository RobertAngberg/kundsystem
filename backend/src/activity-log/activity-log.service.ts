import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateActivityLogDto {
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityLogDto) {
    return this.prisma.activityLog.create({
      data,
    });
  }

  // Hämta aktivitetslogg (endast användarens egen data)
  async findAll(limit = 50, userId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByEntity(entityType: string, entityId: number) {
    return this.prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Hjälpmetoder för att logga specifika händelser
  async logCreated(
    entityType: string,
    entityId: number,
    entityName: string,
    userId?: string,
  ) {
    return this.create({
      action: 'created',
      entityType,
      entityId,
      entityName,
      userId,
    });
  }

  async logUpdated(
    entityType: string,
    entityId: number,
    entityName: string,
    userId?: string,
  ) {
    return this.create({
      action: 'updated',
      entityType,
      entityId,
      entityName,
      userId,
    });
  }

  async logDeleted(
    entityType: string,
    entityId: number,
    entityName: string,
    userId?: string,
  ) {
    return this.create({
      action: 'deleted',
      entityType,
      entityId,
      entityName,
      userId,
    });
  }

  async logStageChanged(
    entityId: number,
    entityName: string,
    oldStage: string,
    newStage: string,
    userId?: string,
  ) {
    return this.create({
      action: 'stage_changed',
      entityType: 'deal',
      entityId,
      entityName,
      oldValue: oldStage,
      newValue: newStage,
      userId,
    });
  }

  async logTaskCompleted(
    entityId: number,
    entityName: string,
    userId?: string,
  ) {
    return this.create({
      action: 'completed',
      entityType: 'task',
      entityId,
      entityName,
      userId,
    });
  }
}
