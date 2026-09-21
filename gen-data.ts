import mongoose from 'mongoose';
import { CategoriaModel } from './src/api/categoria/categoria.model';

// Elenco basato sugli esempi della consegna. "Apertura Conto" è marcata
// Entrata per convenzione (il movimento di apertura ha comunque importo 0,
// quindi il segno non incide sul saldo) — se il prof preferisce diversamente
// basta cambiare questa riga.
const categorie: { nomeCategoria: string, tipologia: 'Entrata' | 'Uscita' }[] = [
  { nomeCategoria: 'Apertura Conto', tipologia: 'Entrata' },
  { nomeCategoria: 'Bonifico Entrata', tipologia: 'Entrata' },
  { nomeCategoria: 'Bonifico Uscita', tipologia: 'Uscita' },
  { nomeCategoria: 'Prelievo Contanti', tipologia: 'Uscita' },
  { nomeCategoria: 'Pagamento Utenze', tipologia: 'Uscita' },
  { nomeCategoria: 'Ricarica Telefonica', tipologia: 'Uscita' },
  { nomeCategoria: 'Versamento Bancomat', tipologia: 'Entrata' },
  { nomeCategoria: 'Stipendio', tipologia: 'Entrata' },
  { nomeCategoria: 'Addebito Diretto', tipologia: 'Uscita' },
];

mongoose.connect('mongodb://localhost:27017/conti-correnti')
  .then(() => CategoriaModel.deleteMany({}))
  .then(() => CategoriaModel.create(categorie))
  .then(() => {
    console.log(`inserite ${categorie.length} categorie`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
