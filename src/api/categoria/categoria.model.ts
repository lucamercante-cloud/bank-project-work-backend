import { model, Schema } from "mongoose";
import { Categoria } from "./categoria.entity";

const categoriaSchema = new Schema<Categoria>({
  nomeCategoria: { type: String, required: true, unique: true },
  tipologia: { type: String, required: true, enum: ["Entrata", "Uscita"] },
});

categoriaSchema.set("toJSON", {
  transform: (_, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

categoriaSchema.set("toObject", {
  transform: (_, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CategoriaModel = model<Categoria>("Categoria", categoriaSchema);
