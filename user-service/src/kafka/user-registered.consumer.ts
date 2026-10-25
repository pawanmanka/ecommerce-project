import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';
import { UserProfilesService } from '../user-profiles/user-profiles.service.js';
import {
  USER_REGISTERED_TOPIC,
  parseUserRegisteredEvent,
} from './user-registered.event.js';

@Injectable()
export class UserRegisteredConsumer
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(UserRegisteredConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    config: ConfigService,
    private readonly profiles: UserProfilesService,
  ) {
    const brokers = (config.get<string>('KAFKA_BROKERS') ?? 'localhost:9092')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);
    if (brokers.length === 0) {
      throw new Error('KAFKA_BROKERS must contain at least one broker');
    }

    const kafka = new Kafka({ clientId: 'user-service', brokers });
    this.consumer = kafka.consumer({
      groupId: 'user-service-user-registered-v1',
      allowAutoTopicCreation: false,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: USER_REGISTERED_TOPIC,
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          throw new Error('Received an empty user registration event');
        }
        const event = parseUserRegisteredEvent(message.value);
        await this.profiles.upsertFromRegistration(
          event.data.userId,
          event.data.name,
        );
        this.logger.log(
          `Stored profile for registered user ${event.data.userId}`,
        );
      },
    });
    this.logger.log(`Kafka consumer subscribed to ${USER_REGISTERED_TOPIC}`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.consumer.disconnect();
  }
}
