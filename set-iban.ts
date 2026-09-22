import "dotenv/config";
import mongoose from "mongoose";
import { ContoCorrenteModel } from "./src/api/conto-corrente/conto-corrente.model";

// Genera un IBAN "finto" ma univoco, deterministico a partire dall'id
// dell'account (così ogni account ha sempre lo stesso IBAN se rilanci lo
// script). Non è un IBAN calcolato con l'algoritmo reale (checksum ecc):
// per questo esercizio ci basta che sia univoco e abbia la forma giusta.
function generaIban(accountId: string): string {
  const numerico = accountId
    .split("")
    .map((c) => (/[a-f]/.test(c) ? (c.charCodeAt(0) - 96).toString() : c))
    .join("")
    .slice(-12)
    .padStart(12, "0");

  return `IT60X0542811101${numerico}`;
}

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("ERRORE: MONGO_URI non è definita nel file .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  // solo gli account che NON hanno ancora un iban: così puoi rilanciare lo
  // script dopo ogni nuova ondata di registrazioni, senza toccare quelli
  // già impostati
  const accounts = await ContoCorrenteModel.find({ iban: { $exists: false } });

  for (const account of accounts) {
    account.iban = generaIban(account.id);
    await account.save();
    console.log(`${account.email} -> ${account.iban}`);
  }

  console.log(`aggiornati ${accounts.length} account`);
  process.exit();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
