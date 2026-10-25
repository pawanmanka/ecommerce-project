import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly resetUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(config: ConfigService) {
    this.transporter = nodemailer.createTransport(
      config.getOrThrow<string>("SMTP_URL"),
    );
    this.from = config.getOrThrow<string>("SMTP_FROM");
    this.resetUrl = config.getOrThrow<string>("PASSWORD_RESET_URL");
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const link = new URL(this.resetUrl);
    link.searchParams.set("token", token);
    this.logger.log(
      `Password reset link generated for ${email}: ${link.toString()}`,
    );
    // await this.transporter.sendMail({
    //   from: this.from,
    //   to: email,
    //   subject: "Reset your password",
    //   text: `Use this link to reset your password. It expires in 30 minutes:\n${link.toString()}`,
    // });
  }
}
