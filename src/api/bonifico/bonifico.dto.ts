import { IsNumber, IsPositive, IsString, MinLength } from "class-validator";

export class CreateBonificoDto {
  @IsString()
  @MinLength(1)
  ibanDestinatario: string;

  @IsNumber()
  @IsPositive()
  importo: number;
}
