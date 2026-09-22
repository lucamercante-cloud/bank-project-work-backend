import { IsString, Matches, MinLength } from "class-validator";

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export class UpdatePasswordDto {
  @IsString()
  @MinLength(1)
  vecchiaPassword: string;

  @Matches(PASSWORD_PATTERN, {
    message:
      "la nuova password deve avere almeno 8 caratteri, una maiuscola e un simbolo",
  })
  nuovaPassword: string;

  @IsString()
  @MinLength(1)
  confermaNuovaPassword: string;
}
