import "dotenv/config";
import mongoose from "mongoose";
import { CategoriaModel } from "./src/api/categoria/categoria.model";

const categorie: { nomeCategoria: string; tipologia: "Entrata" | "Uscita" }[] =
  [
    { nomeCategoria: "Apertura Conto", tipologia: "Entrata" },
    { nomeCategoria: "Bonifico Entrata", tipologia: "Entrata" },
    { nomeCategoria: "Bonifico Uscita", tipologia: "Uscita" },
    { nomeCategoria: "Prelievo Contanti", tipologia: "Uscita" },
    { nomeCategoria: "Pagamento Utenze", tipologia: "Uscita" },
    { nomeCategoria: "Ricarica Telefonica", tipologia: "Uscita" },
    { nomeCategoria: "Versamento Bancomat", tipologia: "Entrata" },
    { nomeCategoria: "Stipendio", tipologia: "Entrata" },
    { nomeCategoria: "Addebito Diretto", tipologia: "Uscita" },
  ];

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("ERRORE: MONGO_URI non è definita nel file .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => CategoriaModel.deleteMany({}))
  .then(() => CategoriaModel.create(categorie))
  .then(() => {
    console.log(`inserite ${categorie.length} categorie`);
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
