import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddMemberDto } from './dto/team.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('teams')
@UseGuards(AuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamsService.create(createTeamDto, req.user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.teamsService.findBySlug(slug);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.getTeamStats(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.delete(id);
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.teamsService.addMember(
      id,
      addMemberDto.userId,
      addMemberDto.role,
    );
  }

  @Delete(':id/members/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMember(id, userId);
  }

  @Put(':id/members/:userId/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId') userId: string,
    @Body('role') role: string,
  ) {
    return this.teamsService.updateMemberRole(id, userId, role);
  }
}
