import { Type } from "class-transformer";
import { IsDateString, IsInt, IsMongoId, IsOptional, Min } from "class-validator";

// Un solo DTO copre RicercaMovimenti1/2/3 della consegna:
// - solo "n" valorizzato          -> RicercaMovimenti1 (torna anche il saldo finale)
// - "n" + categoriaId             -> RicercaMovimenti2 (niente saldo finale)
// - "n" + dataInizio/dataFine     -> RicercaMovimenti3 (niente saldo finale)
export class QueryMovimentoDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  n?: number;

  @IsMongoId()
  @IsOptional()
  categoriaId?: string;

  @IsDateString()
  @IsOptional()
  dataInizio?: string;

  @IsDateString()
  @IsOptional()
  dataFine?: string;
}
