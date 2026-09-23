import { IsIn, IsString, MinLength } from "class-validator";

const OPERATORI = ["iliad", "tim", "vodafone", "windtre"];
const TAGLI = [5, 15, 10, 20, 30, 50];

export class CreateRicaricaDto {
  @IsString()
  @MinLength(6)
  numeroTelefono: string;

  @IsIn(OPERATORI)
  operatore: string;

  @IsIn(TAGLI)
  taglio: number;
}
