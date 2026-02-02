import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Hämta alla tasks (endast användarens egen data)
  async findAll(ownerId: string) {
    return await this.prisma.task.findMany({
      where: { ownerId },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
    });
  }

  async findUpcoming(ownerId: string, days: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.prisma.task.findMany({
      where: {
        ownerId,
        completed: false,
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOverdue(ownerId: string) {
    const now = new Date();

    return await this.prisma.task.findMany({
      where: {
        ownerId,
        completed: false,
        dueDate: {
          lt: now,
        },
      },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
    });

    // Logga aktivitet
    await this.prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'task',
        entityId: task.id,
        entityName: task.title,
      },
    });

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : undefined,
      },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
    });

    // Logga aktivitet
    await this.prisma.activityLog.create({
      data: {
        action: 'updated',
        entityType: 'task',
        entityId: task.id,
        entityName: task.title,
      },
    });

    return task;
  }

  async toggleComplete(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
      include: {
        customer: true,
        deal: { include: { customer: true } },
        owner: true,
      },
    });

    // Logga aktivitet
    await this.prisma.activityLog.create({
      data: {
        action: updatedTask.completed ? 'completed' : 'reopened',
        entityType: 'task',
        entityId: updatedTask.id,
        entityName: updatedTask.title,
      },
    });

    return updatedTask;
  }

  async remove(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (task) {
      // Logga aktivitet innan borttagning
      await this.prisma.activityLog.create({
        data: {
          action: 'deleted',
          entityType: 'task',
          entityId: task.id,
          entityName: task.title,
        },
      });
    }

    return await this.prisma.task.delete({
      where: { id },
    });
  }

  async getStats(ownerId: string) {
    const where = { ownerId };
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const tasks: Task[] = await this.prisma.task.findMany({ where });

    const stats = {
      total: tasks.length,
      completed: tasks.filter((t: Task) => t.completed).length,
      pending: tasks.filter((t: Task) => !t.completed).length,
      overdue: tasks.filter(
        (t: Task) => !t.completed && t.dueDate && new Date(t.dueDate) < now,
      ).length,
      dueSoon: tasks.filter(
        (t: Task) =>
          !t.completed &&
          t.dueDate &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= threeDaysFromNow,
      ).length,
    };

    return stats;
  }
}
