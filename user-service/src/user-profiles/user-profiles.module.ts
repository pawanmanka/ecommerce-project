import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserRegisteredConsumer } from '../kafka/user-registered.consumer.js';
import { UserProfile } from '../users/user-profile.entity.js';
import { UserProfilesController } from './user-profiles.controller.js';
import { UserProfilesService } from './user-profiles.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [UserProfilesController],
  providers: [UserProfilesService, JwtAuthGuard, UserRegisteredConsumer],
})
export class UserProfilesModule {}
