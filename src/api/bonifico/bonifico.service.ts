import { ContoCorrente } from "../conto-corrente/conto-corrente.entity";
import { ContoCorrenteModel } from "../conto-corrente/conto-corrente.model";
import movimentoSrv from "../movimento/movimento.service";
import categoriaSrv from "../categoria/categoria.service";
import { IbanNotFoundError } from "../../errors/iban-not-found.error";
import { InsufficientBalanceError } from "../../errors/insufficient-balance.error";
import { Movimento } from "../movimento/movimento.entity";

export class BonificoService {

  async esegui(
    mittente: ContoCorrente,
    ibanDestinatario: string,
    importo: number
  ): Promise<Movimento> {

    const destinatario = await ContoCorrenteModel.findOne({ iban: ibanDestinatario });
    if (!destinatario) {
      throw new IbanNotFoundError();
    }

    const saldoMittente = await movimentoSrv.getSaldoAttuale(mittente.id);
    if (saldoMittente < importo) {
      throw new InsufficientBalanceError();
    }

    const categoriaUscita = await categoriaSrv.getByNome('Bonifico Uscita');
    const categoriaEntrata = await categoriaSrv.getByNome('Bonifico Entrata');
    if (!categoriaUscita || !categoriaEntrata) {
      throw new Error('categorie "Bonifico Uscita"/"Bonifico Entrata" non trovate: hai lanciato npm run gen-data?');
    }

    // movimento in uscita sul conto del mittente
    const movimentoUscita = await movimentoSrv.create(mittente.id, {
      importo,
      categoriaMovimentoId: categoriaUscita.id,
      descrizioneEstesa: `Bonifico disposto a favore di ${ibanDestinatario}`
    });

    // movimento in entrata sul conto del destinatario
    await movimentoSrv.create(destinatario.id, {
      importo,
      categoriaMovimentoId: categoriaEntrata.id,
      descrizioneEstesa: `Bonifico disposto da ${mittente.nomeTitolare} ${mittente.cognomeTitolare}`
    });

    return movimentoUscita;
  }
}

export default new BonificoService();
