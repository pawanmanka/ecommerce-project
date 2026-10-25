export const USER_REGISTERED_TOPIC = "user.registered.v1";

export interface UserRegisteredEvent {
  eventId: string;
  eventType: typeof USER_REGISTERED_TOPIC;
  occurredAt: string;
  data: {
    userId: string;
    name: string;
  };
}
