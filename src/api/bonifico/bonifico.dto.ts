import {
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class CreateBonificoDto {
  @IsString()
  @MinLength(1)
  beneficiario: string;

  @IsNumber()
  @IsPositive()
  importo: number;

  @IsString()
  @MinLength(1)
  iban: string;

  @IsString()
  @MinLength(1)
  causale: string;

  @IsDateString()
  dataEsecuzione: string;
}
