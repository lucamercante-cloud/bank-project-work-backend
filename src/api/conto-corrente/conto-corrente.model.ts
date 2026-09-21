import { model, Schema } from "mongoose";
import { ContoCorrente } from "./conto-corrente.entity";

// hashedPassword è un campo dello schema/DB ma NON dell'entity pubblica:
// serve per il confronto in local-strategy.ts, non deve mai uscire nelle
// risposte JSON (il transform sotto lo rimuove).
type ContoCorrenteDocument = ContoCorrente & { hashedPassword: string };

const contoCorrenteSchema = new Schema<ContoCorrenteDocument>({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  nomeTitolare: { type: String, required: true },
  cognomeTitolare: { type: String, required: true },
  dataApertura: { type: Date, required: true, default: () => new Date() },
  iban: { type: String, required: false }
});

contoCorrenteSchema.set('toJSON', {
  transform: (_, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.hashedPassword;
    return ret;
  }
});

contoCorrenteSchema.set('toObject', {
  transform: (_, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.hashedPassword;
    return ret;
  }
});

export const ContoCorrenteModel =
  model<ContoCorrenteDocument>('ContoCorrente', contoCorrenteSchema);
