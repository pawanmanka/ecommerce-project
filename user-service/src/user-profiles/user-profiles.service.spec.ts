import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProfilesService } from './user-profiles.service.js';
import { UserProfile } from '../users/user-profile.entity.js';

describe('UserProfilesService', () => {
  let service: UserProfilesService;
  let findOneBy: ReturnType<typeof vi.fn>;
  let upsert: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneBy = vi.fn();
    upsert = vi.fn();
    const module = await Test.createTestingModule({
      providers: [
        UserProfilesService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: { findOneBy, upsert },
        },
      ],
    }).compile();
    service = module.get(UserProfilesService);
  });

  it('returns the profile matching its auth-service user ID', async () => {
    const profile = { userId: 'user-id', name: 'Alex' };
    findOneBy.mockResolvedValue(profile);

    await expect(service.getByUserId(profile.userId)).resolves.toBe(profile);
    expect(findOneBy).toHaveBeenCalledWith({ userId: profile.userId });
  });

  it('throws a not-found error when the profile does not exist', async () => {
    findOneBy.mockResolvedValue(null);

    await expect(service.getByUserId('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upserts a profile from a registration event', async () => {
    await service.upsertFromRegistration('registered-user-id', 'Alex Example');

    expect(upsert).toHaveBeenCalledWith(
      { userId: 'registered-user-id', name: 'Alex Example' },
      ['userId'],
    );
  });
});
