import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../users/user-profile.entity.js';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
  ) {}

  async getByUserId(userId: string): Promise<UserProfile> {
    const profile = await this.profiles.findOneBy({ userId });
    if (!profile) {
      throw new NotFoundException(`User profile for ${userId} was not found`);
    }
    return profile;
  }

  async upsertFromRegistration(userId: string, name: string): Promise<void> {
    await this.profiles.upsert({ userId, name }, ['userId']);
  }
}
