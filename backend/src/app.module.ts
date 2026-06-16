import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './identity/identity.module';
import { AviationModule } from './aviation/aviation.module';
import { CommerceModule } from './commerce/commerce.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    IdentityModule,
    AviationModule,
    CommerceModule,
    MonitoringModule,
  ],
})
export class AppModule {}
