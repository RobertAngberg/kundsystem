import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto, creatorId: string) {
    // Skapa teamet
    const team = await this.prisma.team.create({
      data: {
        ...createTeamDto,
      },
    });

    // Lägg till skaparen som admin
    await this.prisma.profile.update({
      where: { id: creatorId },
      data: {
        teamId: team.id,
        role: 'admin',
      },
    });

    return this.findOne(team.id);
  }

  async findAll() {
    return await this.prisma.team.findMany({
      include: {
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            customers: true,
            companies: true,
            deals: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            customers: true,
            companies: true,
            deals: true,
            tasks: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team med id ${id} hittades inte`);
    }

    return team;
  }

  async findBySlug(slug: string) {
    const team = await this.prisma.team.findUnique({
      where: { slug },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team med slug ${slug} hittades inte`);
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    await this.findOne(id); // Kontrollera att teamet finns

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    await this.findOne(id); // Kontrollera att teamet finns

    // Ta bort team-koppling från alla medlemmar först
    await this.prisma.profile.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    });

    return this.prisma.team.delete({
      where: { id },
    });
  }

  async addMember(teamId: number, userId: string, role: string = 'sales') {
    await this.findOne(teamId);

    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Användare med id ${userId} hittades inte`);
    }

    if (user.teamId) {
      throw new BadRequestException('Användaren tillhör redan ett team');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        teamId,
        role,
      },
    });
  }

  async removeMember(teamId: number, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user || user.teamId !== teamId) {
      throw new BadRequestException('Användaren tillhör inte detta team');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        teamId: null,
        role: 'sales', // Återställ till default
      },
    });
  }

  async updateMemberRole(teamId: number, userId: string, role: string) {
    const validRoles = ['admin', 'sales', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Ogiltig roll: ${role}`);
    }

    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user || user.teamId !== teamId) {
      throw new BadRequestException('Användaren tillhör inte detta team');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: { role },
    });
  }

  async getTeamStats(teamId: number) {
    const team = await this.findOne(teamId);

    const [customers, deals, tasks, wonDeals] = await Promise.all([
      this.prisma.customer.count({ where: { teamId } }),
      this.prisma.deal.findMany({ where: { teamId } }),
      this.prisma.task.findMany({ where: { teamId } }),
      this.prisma.deal.findMany({ where: { teamId, stage: 'won' } }),
    ]);

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const completedTasks = tasks.filter((t) => t.completed).length;

    return {
      team: {
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
      },
      stats: {
        customers,
        deals: deals.length,
        totalValue,
        wonValue,
        tasks: tasks.length,
        completedTasks,
        winRate:
          deals.length > 0
            ? Math.round(
                (wonDeals.length /
                  deals.filter((d) => d.stage === 'won' || d.stage === 'lost')
                    .length) *
                  100,
              ) || 0
            : 0,
      },
    };
  }
}
