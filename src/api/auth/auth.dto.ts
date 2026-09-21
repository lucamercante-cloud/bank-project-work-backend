import { IsEmail, IsString, Matches, MinLength } from "class-validator";

// Regola dalla consegna: "Password almeno 8 caratteri, una maiuscola e un simbolo"
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export class RegisterDto {
  @IsEmail()
  email: string;

  @Matches(PASSWORD_PATTERN, {
    message: 'la password deve avere almeno 8 caratteri, una maiuscola e un simbolo'
  })
  password: string;

  // il controllo "uguale a password" va oltre quello che class-validator
  // fa comodamente su un solo campo: viene ricontrollato nel controller
  @IsString()
  @MinLength(1)
  confermaPassword: string;

  @IsString()
  @MinLength(1)
  nomeTitolare: string;

  @IsString()
  @MinLength(1)
  cognomeTitolare: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
