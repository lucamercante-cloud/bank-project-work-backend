import { Types } from "mongoose";
import { Categoria } from "../categoria/categoria.entity";

export interface Movimento {
  id: string;
  contoCorrente?: Types.ObjectId; // interno, mai esposto (i movimenti sono sempre quelli dell'utente loggato)
  data: Date;
  importo: number;                // sempre positivo, il segno lo decide categoriaMovimento.tipologia
  saldo: number;                  // calcolato dal server, mai passato dal client
  categoriaMovimento: string | Categoria;
  descrizioneEstesa: string;
}

//contoCorrente?: { type: Types.ObjectId, ref: "ContoCorrente" }
