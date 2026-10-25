import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { MoreThan, QueryFailedError, Repository } from "typeorm";
import { User } from "../users/user.entity.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { MailService } from "./mail.service.js";
import { KafkaProducerService } from "../kafka/kafka-producer.service.js";

const PASSWORD_HASH_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async register(dto: RegisterDto) {
    this.assertPasswordLength(dto.password);
    const email = this.normalizeEmail(dto.email);
    if (await this.users.findOneBy({ email })) {
      throw new ConflictException("An account with this email already exists");
    }

    const user = this.users.create({
      email,
      passwordHash: await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS),
    });
    try {
      await this.users.save(user);
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }
      throw error;
    }

    await this.kafkaProducer.publishUserRegistered({
      userId: user.id,
      name: dto.name,
    });

    const session = await this.createSession(user);
    return {
      ...session,
      user: { ...session.user, name: dto.name },
    };
  }

  async login(dto: LoginDto) {
    this.assertPasswordLength(dto.password);
    const user = await this.users.findOneBy({
      email: this.normalizeEmail(dto.email),
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return this.createSession(user);
  }

  async requestPasswordReset(
    dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    const user = await this.users.findOneBy({
      email: this.normalizeEmail(dto.email),
    });
    if (user) {
      const token = randomBytes(32).toString("base64url");
      user.resetPasswordTokenHash = this.hashToken(token);
      user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await this.users.save(user);
      await this.mail.sendPasswordReset(user.email, token);
    }

    return {
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.assertPasswordLength(dto.newPassword);
    const tokenHash = this.hashToken(dto.token);
    const user = await this.users
      .createQueryBuilder("user")
      .addSelect("user.resetPasswordTokenHash")
      .addSelect("user.resetPasswordExpiresAt")
      .where("user.resetPasswordTokenHash = :tokenHash", { tokenHash })
      .andWhere("user.resetPasswordExpiresAt > :now", { now: new Date() })
      .getOne();
    if (!user) {
      throw new BadRequestException(
        "The password reset link is invalid or expired",
      );
    }

    const result = await this.users.update(
      {
        id: user.id,
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: MoreThan(new Date()),
      },
      {
        passwordHash: await bcrypt.hash(dto.newPassword, PASSWORD_HASH_ROUNDS),
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    );
    if (result.affected !== 1) {
      throw new BadRequestException(
        "The password reset link is invalid or expired",
      );
    }

    return { message: "Password has been reset successfully." };
  }

  private async createSession(user: User) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: Number(this.config.get("JWT_EXPIRES_IN") ?? 900),
      user: { id: user.id, email: user.email },
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private assertPasswordLength(password: string): void {
    if (Buffer.byteLength(password, "utf8") > 72) {
      throw new BadRequestException("Password must not exceed 72 UTF-8 bytes");
    }
  }

  private isDuplicateEmailError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === "ER_DUP_ENTRY"
    );
  }
}
