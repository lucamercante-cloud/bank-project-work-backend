import { Transform } from "class-transformer";
import { IsIn, IsString, Matches } from "class-validator";

const OPERATORI = ["iliad", "tim", "vodafone", "windtre"];
const TAGLI = [5, 10, 15, 20, 30, 50];

// Cellulare italiano: inizia con 3 e ha 9 o 10 cifre totali (es. 3331234567)
const CELLULARE_IT = /^3\d{8,9}$/;

export class CreateRicaricaDto {
  // Pulisce il numero prima di validarlo: toglie spazi, punti, trattini,
  // parentesi e il prefisso +39 / 0039 (così "+39 333 123 4567" diventa "3331234567")
  @Transform(({ value }) =>
    typeof value === "string"
      ? value.replace(/[\s.\-()]/g, "").replace(/^(\+39|0039)/, "")
      : value,
  )
  @IsString({ message: "numeroTelefono deve essere una stringa" })
  @Matches(CELLULARE_IT, {
    message:
      "numeroTelefono non valido: inserire un cellulare italiano (es. 3331234567)",
  })
  numeroTelefono: string;

  @IsIn(OPERATORI)
  operatore: string;

  @IsIn(TAGLI)
  taglio: number;
}
