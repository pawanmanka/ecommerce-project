import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuthService } from '../dist/auth/auth.service.js';

function createService() {
  const records = [];
  const users = {
    findOneBy: async (criteria) =>
      records.find((user) =>
        Object.entries(criteria).every(([key, value]) => user[key] === value),
      ) ?? null,
    create: (values) => ({ ...values }),
    save: async (user) => {
      user.id ??= 'user-id';
      const index = records.findIndex((record) => record.id === user.id);
      if (index === -1) records.push(user);
      else records[index] = user;
      return user;
    },
    createQueryBuilder: () => {
      let tokenHash;
      return {
        addSelect() {
          return this;
        },
        where(_condition, parameters) {
          tokenHash = parameters.tokenHash;
          return this;
        },
        andWhere() {
          return this;
        },
        getOne: async () =>
          records.find((user) => user.resetPasswordTokenHash === tokenHash) ??
          null,
      };
    },
    update: async (criteria, values) => {
      const user = records.find(
        (record) =>
          record.id === criteria.id &&
          record.resetPasswordTokenHash === criteria.resetPasswordTokenHash &&
          record.resetPasswordExpiresAt > criteria.resetPasswordExpiresAt._value,
      );
      if (!user) return { affected: 0 };
      Object.assign(user, values);
      return { affected: 1 };
    },
  };
  const sentEmails = [];
  const publishedEvents = [];
  const service = new AuthService(
    users,
    { signAsync: async () => 'signed-jwt' },
    { get: () => 900 },
    { sendPasswordReset: async (...message) => sentEmails.push(message) },
    {
      publishUserRegistered: async (event) => publishedEvents.push(event),
    },
  );
  return { service, records, sentEmails, publishedEvents };
}

test('registers, logs in, and rejects invalid credentials', async () => {
  const { service, records, publishedEvents } = createService();
  const registration = await service.register({
    name: 'Alex Example',
    email: 'Person@Example.com',
    password: 'correct-horse-battery',
  });

  assert.equal(registration.accessToken, 'signed-jwt');
  assert.equal(registration.user.email, 'person@example.com');
  assert.equal(registration.user.name, 'Alex Example');
  assert.deepEqual(publishedEvents[0], {
    userId: 'user-id',
    name: 'Alex Example',
  });
  assert.equal(records[0].passwordHash.includes('correct-horse-battery'), false);
  assert.equal(
    (await service.login({
      email: 'PERSON@example.com',
      password: 'correct-horse-battery',
    })).user.id,
    'user-id',
  );
  await assert.rejects(
    service.login({ email: 'person@example.com', password: 'wrong-password' }),
    { status: 401 },
  );
});

test('sends a single-use reset link and updates the password', async () => {
  const { service, records, sentEmails } = createService();
  await service.register({
    name: 'Person Example',
    email: 'person@example.com',
    password: 'correct-horse-battery',
  });
  const response = await service.requestPasswordReset({
    email: 'person@example.com',
  });
  assert.match(response.message, /If an account exists/);
  assert.equal(sentEmails.length, 1);
  const [email, token] = sentEmails[0];
  assert.equal(email, 'person@example.com');
  assert.notEqual(records[0].resetPasswordTokenHash, token);

  await service.resetPassword({
    token,
    newPassword: 'another-correct-password',
  });
  assert.equal(records[0].resetPasswordTokenHash, null);
  await assert.rejects(
    service.resetPassword({
      token,
      newPassword: 'third-correct-password',
    }),
    { status: 400 },
  );
  assert.equal(
    (
      await service.login({
        email: 'person@example.com',
        password: 'another-correct-password',
      })
    ).user.id,
    'user-id',
  );
});

test('returns the same reset response for an unknown email', async () => {
  const { service, sentEmails } = createService();
  const response = await service.requestPasswordReset({
    email: 'missing@example.com',
  });

  assert.match(response.message, /If an account exists/);
  assert.equal(sentEmails.length, 0);
});
