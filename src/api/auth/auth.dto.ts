import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from "class-validator";

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export class RegisterDto {
  @IsEmail()
  email: string;

  @Matches(PASSWORD_PATTERN, {
    message:
      "la password deve avere almeno 8 caratteri, una maiuscola e un simbolo",
  })
  password: string;

  @IsString()
  @MinLength(1)
  confermaPassword: string;

  @IsString()
  @MinLength(1)
  nomeTitolare: string;

  @IsString()
  @MinLength(1)
  cognomeTitolare: string;

  @IsUrl()
  @IsOptional()
  fotoProfilo?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
