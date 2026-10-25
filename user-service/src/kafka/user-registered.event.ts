export const USER_REGISTERED_TOPIC = 'user.registered.v1';

export interface UserRegisteredEvent {
  eventId: string;
  eventType: typeof USER_REGISTERED_TOPIC;
  occurredAt: string;
  data: {
    userId: string;
    name: string;
  };
}

export function parseUserRegisteredEvent(value: Buffer): UserRegisteredEvent {
  const event: unknown = JSON.parse(value.toString('utf8'));
  if (!isRecord(event) || event.eventType !== USER_REGISTERED_TOPIC) {
    throw new Error(`Invalid ${USER_REGISTERED_TOPIC} event`);
  }

  const { eventId, occurredAt, data } = event;
  if (
    typeof eventId !== 'string' ||
    typeof occurredAt !== 'string' ||
    !isRecord(data) ||
    typeof data.userId !== 'string' ||
    !isUuid(data.userId) ||
    typeof data.name !== 'string' ||
    data.name.trim().length === 0 ||
    data.name.length > 150
  ) {
    throw new Error(`Invalid ${USER_REGISTERED_TOPIC} event payload`);
  }

  return {
    eventId,
    eventType: USER_REGISTERED_TOPIC,
    occurredAt,
    data: {
      userId: data.userId,
      name: data.name.trim(),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);
}
