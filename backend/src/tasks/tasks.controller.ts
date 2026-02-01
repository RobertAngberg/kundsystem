import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() req, @Query('filter') filter?: string) {
    const { sub: userId, teamId, isAdmin } = req.user;

    if (filter === 'upcoming') {
      return this.tasksService.findUpcoming(userId, teamId, isAdmin);
    }
    if (filter === 'overdue') {
      return this.tasksService.findOverdue(userId, teamId, isAdmin);
    }
    return this.tasksService.findAll(userId, teamId, isAdmin);
  }

  @Get('stats')
  getStats(@Request() req) {
    const { sub: userId, teamId, isAdmin } = req.user;
    return this.tasksService.getStats(userId, teamId, isAdmin);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create({
      ...createTaskDto,
      ownerId: createTaskDto.ownerId || req.user.sub,
      teamId: req.user.teamId,
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Put(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  toggleComplete(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.toggleComplete(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
