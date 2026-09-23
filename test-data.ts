import "dotenv/config";
import mongoose from "mongoose";
import { ContoCorrenteModel } from "./src/api/conto-corrente/conto-corrente.model";
import movimentoSrv from "./src/api/movimento/movimento.service";
import categoriaSrv from "./src/api/categoria/categoria.service";

const EMAIL = process.argv[2] || "caleb.frimpong@test.it";

const movimentiDiProva = [
  { categoria: "Apertura Conto", importo: 0, descrizione: "Apertura Conto" },
  { categoria: "Stipendio", importo: 1500, descrizione: "Stipendio mensile" },
  { categoria: "Pagamento Utenze", importo: 80, descrizione: "Bolletta luce" },
  {
    categoria: "Prelievo Contanti",
    importo: 100,
    descrizione: "Prelievo sportello",
  },
  {
    categoria: "Ricarica Telefonica",
    importo: 10,
    descrizione: "Ricarica iliad",
  },
  {
    categoria: "Versamento Bancomat",
    importo: 200,
    descrizione: "Versamento contanti",
  },
  { categoria: "Pagamento Utenze", importo: 45, descrizione: "Bolletta gas" },
  { categoria: "Stipendio", importo: 1500, descrizione: "Stipendio mensile" },
  {
    categoria: "Prelievo Contanti",
    importo: 50,
    descrizione: "Prelievo sportello",
  },
  {
    categoria: "Versamento Bancomat",
    importo: 150,
    descrizione: "Versamento contanti",
  },
];

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("ERRORE: MONGO_URI non è definita nel file .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const account = await ContoCorrenteModel.findOne({ email: EMAIL });
  if (!account) {
    console.error(
      `nessun account trovato con email ${EMAIL} (registralo prima con /api/register)`,
    );
    process.exit(1);
  }

  for (const m of movimentiDiProva) {
    const categoria = await categoriaSrv.getByNome(m.categoria);
    if (!categoria) {
      console.warn(
        `categoria "${m.categoria}" non trovata: hai lanciato "npm run gen-data"? salto.`,
      );
      continue;
    }
    await movimentoSrv.create(account.id, {
      importo: m.importo,
      categoriaMovimentoId: categoria.id,
      descrizioneEstesa: m.descrizione,
    });
    console.log(`creato: ${m.descrizione}`);
  }

  console.log(`fatto: 10 movimenti creati per ${EMAIL}`);
  console.log(
    `ricorda: la consegna ne chiede almeno 10 per DUE conti di test, rilancia con una seconda email`,
  );
  process.exit();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
