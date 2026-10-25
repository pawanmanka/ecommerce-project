import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, type Producer } from "kafkajs";
import { randomUUID } from "node:crypto";
import {
  USER_REGISTERED_TOPIC,
  type UserRegisteredEvent,
} from "./user-registered.event.js";

@Injectable()
export class KafkaProducerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;

  constructor(config: ConfigService) {
    const brokers = this.getBrokers(config);
    const kafka = new Kafka({ clientId: "auth-service", brokers });
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.logger.log(`Kafka producer ready; topic ${USER_REGISTERED_TOPIC}`);
  }

  async publishUserRegistered(
    data: UserRegisteredEvent["data"],
  ): Promise<void> {
    const event: UserRegisteredEvent = {
      eventId: randomUUID(),
      eventType: USER_REGISTERED_TOPIC,
      occurredAt: new Date().toISOString(),
      data,
    };
    await this.producer.send({
      topic: USER_REGISTERED_TOPIC,
      acks: -1,
      messages: [{ key: data.userId, value: JSON.stringify(event) }],
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.disconnect();
  }

  private getBrokers(config: ConfigService): string[] {
    const brokers = (config.get<string>("KAFKA_BROKERS") ?? "localhost:9092")
      .split(",")
      .map((broker) => broker.trim())
      .filter(Boolean);
    if (brokers.length === 0) {
      throw new Error("KAFKA_BROKERS must contain at least one broker");
    }
    return brokers;
  }
}
