import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index("UQ_users_email", { unique: true })
  @Column({ length: 254 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ type: "char", length: 64, nullable: true, select: false })
  resetPasswordTokenHash: string | null;

  @Column({ type: "datetime", nullable: true, select: false })
  resetPasswordExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
