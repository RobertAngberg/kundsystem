import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { CompaniesModule } from './companies/companies.module';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { DealsModule } from './deals/deals.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { TeamsModule } from './teams/teams.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    CompaniesModule,
    ActivitiesModule,
    AuthModule,
    DealsModule,
    TasksModule,
    ActivityLogModule,
    TeamsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
