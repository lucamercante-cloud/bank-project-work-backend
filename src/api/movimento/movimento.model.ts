import { model, Schema } from "mongoose";
import { Movimento } from "./movimento.entity";

const movimentoSchema = new Schema<Movimento>({
  contoCorrente: {
    type: Schema.Types.ObjectId,
    ref: "ContoCorrente",
    required: true,
  },
  data: { type: Date, required: true, default: () => new Date() },
  importo: { type: Number, required: true, min: 0 },
  saldo: { type: Number, required: true },
  categoriaMovimento: {
    type: Schema.Types.ObjectId,
    ref: "Categoria",
    required: true,
  },
  descrizioneEstesa: { type: String, required: true },
});

movimentoSchema.set("toJSON", {
  transform: (_, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.contoCorrente;
    return ret;
  },
});

movimentoSchema.set("toObject", {
  transform: (_, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MovimentoModel = model<Movimento>("Movimento", movimentoSchema);
