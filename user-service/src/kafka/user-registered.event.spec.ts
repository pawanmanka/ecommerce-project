import {
  parseUserRegisteredEvent,
  USER_REGISTERED_TOPIC,
} from './user-registered.event.js';

const validEvent = {
  eventId: 'f6858e06-5dae-45fd-b745-84b64f75c1b9',
  eventType: USER_REGISTERED_TOPIC,
  occurredAt: '2026-10-25T10:00:00.000Z',
  data: {
    userId: '9d37b202-045e-41dc-a5ba-10449cb05aa1',
    name: '  Alex Example  ',
  },
};

describe('parseUserRegisteredEvent', () => {
  it('validates and normalizes a user registration event', () => {
    const event = parseUserRegisteredEvent(
      Buffer.from(JSON.stringify(validEvent)),
    );

    expect(event.data).toEqual({
      userId: validEvent.data.userId,
      name: 'Alex Example',
    });
  });

  it('rejects an invalid registration event', () => {
    expect(() =>
      parseUserRegisteredEvent(
        Buffer.from(
          JSON.stringify({
            ...validEvent,
            data: { userId: 'not-a-uuid', name: '' },
          }),
        ),
      ),
    ).toThrow(/Invalid user\.registered\.v1 event payload/);
  });
});
