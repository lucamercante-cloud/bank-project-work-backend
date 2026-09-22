import { IsIn, IsString, MinLength } from "class-validator";

const OPERATORI = ["iliad", "tim", "vodafone", "windtre"];
const TAGLI = [5, 10, 20, 30];

export class CreateRicaricaDto {
  @IsString()
  @MinLength(6)
  numeroTelefono: string;

  @IsIn(OPERATORI)
  operatore: string;

  @IsIn(TAGLI)
  taglio: number;
}
