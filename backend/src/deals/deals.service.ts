import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import type { Deal } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId?: string, teamId?: number | null, isAdmin?: boolean) {
    // Admin ser allt, annars filtrerar vi på teamId eller ownerId
    const where = isAdmin
      ? {}
      : teamId
        ? { teamId }
        : ownerId
          ? { ownerId }
          : {};
    return await this.prisma.deal.findMany({
      where,
      include: {
        customer: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.deal.findUnique({
      where: { id },
      include: {
        customer: true,
        owner: true,
      },
    });
  }

  async findByStage(
    stage: string,
    ownerId?: string,
    teamId?: number | null,
    isAdmin?: boolean,
  ) {
    const where = isAdmin
      ? { stage }
      : teamId
        ? { stage, teamId }
        : ownerId
          ? { stage, ownerId }
          : { stage };
    return await this.prisma.deal.findMany({
      where,
      include: {
        customer: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createDealDto: CreateDealDto) {
    const deal = await this.prisma.deal.create({
      data: createDealDto,
      include: {
        customer: true,
        owner: true,
      },
    });

    // Logga aktivitet
    await this.prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'deal',
        entityId: deal.id,
        entityName: deal.title,
      },
    });

    return deal;
  }

  async update(id: number, updateDealDto: UpdateDealDto) {
    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateDealDto,
      include: {
        customer: true,
        owner: true,
      },
    });

    // Logga aktivitet
    await this.prisma.activityLog.create({
      data: {
        action: 'updated',
        entityType: 'deal',
        entityId: deal.id,
        entityName: deal.title,
      },
    });

    return deal;
  }

  async updateStage(id: number, stage: string) {
    // Hämta gammal deal för att logga stegändring
    const oldDeal = await this.prisma.deal.findUnique({ where: { id } });
    const oldStage = oldDeal?.stage;

    const closedAt = ['won', 'lost'].includes(stage) ? new Date() : null;
    const deal = await this.prisma.deal.update({
      where: { id },
      data: { stage, closedAt },
      include: {
        customer: true,
        owner: true,
      },
    });

    // Logga stegändring
    if (oldStage !== stage) {
      await this.prisma.activityLog.create({
        data: {
          action: 'stage_changed',
          entityType: 'deal',
          entityId: deal.id,
          entityName: deal.title,
          oldValue: oldStage,
          newValue: stage,
        },
      });
    }

    return deal;
  }

  async remove(id: number) {
    return await this.prisma.deal.delete({
      where: { id },
    });
  }

  async getStats(ownerId?: string, teamId?: number | null, isAdmin?: boolean) {
    const where = isAdmin
      ? {}
      : teamId
        ? { teamId }
        : ownerId
          ? { ownerId }
          : {};

    const deals: Deal[] = await this.prisma.deal.findMany({ where });

    const stats = {
      total: deals.length,
      totalValue: deals.reduce((sum: number, d: Deal) => sum + d.value, 0),
      byStage: {} as Record<string, { count: number; value: number }>,
      wonValue: 0,
      lostValue: 0,
    };

    const stages = [
      'lead',
      'contact',
      'proposal',
      'negotiation',
      'won',
      'lost',
    ];
    stages.forEach((stage) => {
      const stageDeals = deals.filter((d: Deal) => d.stage === stage);
      stats.byStage[stage] = {
        count: stageDeals.length,
        value: stageDeals.reduce((sum: number, d: Deal) => sum + d.value, 0),
      };
    });

    stats.wonValue = stats.byStage['won']?.value || 0;
    stats.lostValue = stats.byStage['lost']?.value || 0;

    return stats;
  }
}
