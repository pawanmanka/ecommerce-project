import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KafkaProducerService } from "../kafka/kafka-producer.service.js";
import { User } from "../users/user.entity.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { MailService } from "./mail.service.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>("JWT_SECRET");
        if (secret.length < 32) {
          throw new Error("JWT_SECRET must be at least 32 characters long");
        }
        const expiresIn = Number(config.get("JWT_EXPIRES_IN") ?? 900);
        if (!Number.isSafeInteger(expiresIn) || expiresIn <= 0) {
          throw new Error(
            "JWT_EXPIRES_IN must be a positive integer in seconds",
          );
        }
        return { secret, signOptions: { expiresIn } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, KafkaProducerService],
})
export class AuthModule {}
