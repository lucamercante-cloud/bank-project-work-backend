export type TipologiaMovimento = "Entrata" | "Uscita";

export interface Categoria {
  id: string;
  nomeCategoria: string;
  tipologia: TipologiaMovimento;
}
