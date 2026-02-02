import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('activity-log')
@UseGuards(AuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Request() req?: any) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.activityLogService.findAll(
      limitNum,
      req.user.sub,
      req.user.teamId,
      req.user.isAdmin,
    );
  }
}
