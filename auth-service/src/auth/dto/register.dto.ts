import { Transform } from "class-transformer";
import {
  IsEmail,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @MinLength(6)
  @MaxLength(15)
  password: string;
}
