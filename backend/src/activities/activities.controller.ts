import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('activities')
@UseGuards(AuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findAll(@Query('customerId') customerId?: string) {
    if (customerId) {
      return this.activitiesService.findByCustomer(parseInt(customerId));
    }
    return this.activitiesService.findAll();
  }

  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.delete(id);
  }
}
