import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserProfilesModule } from './user-profiles/user-profiles.module.js';
import { UserProfile } from './users/user-profile.entity.js';
import { DailyFileLogger } from './logging/daily-file.logger.js';
import { HttpLoggingInterceptor } from './logging/http-logging.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.get('DB_PORT') ?? 3306),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        entities: [UserProfile],
        synchronize: false,
      }),
    }),
    UserProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService, DailyFileLogger, HttpLoggingInterceptor],
})
export class AppModule {}
