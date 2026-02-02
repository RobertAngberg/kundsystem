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
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('deals')
@UseGuards(AuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  findAll(@Request() req, @Query('stage') stage?: string) {
    const userId = req.user.sub;

    if (stage) {
      return this.dealsService.findByStage(stage, userId);
    }
    return this.dealsService.findAll(userId);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.dealsService.getStats(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  create(@Body() createDealDto: CreateDealDto, @Request() req) {
    return this.dealsService.create({
      ...createDealDto,
      ownerId: createDealDto.ownerId || req.user.sub,
      teamId: req.user.teamId,
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, updateDealDto);
  }

  @Put(':id/stage')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  updateStage(
    @Param('id', ParseIntPipe) id: number,
    @Body('stage') stage: string,
  ) {
    return this.dealsService.updateStage(id, stage);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealsService.remove(id);
  }
}
