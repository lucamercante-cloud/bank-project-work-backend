import { ContoCorrente } from "../conto-corrente/conto-corrente.entity";
import { ContoCorrenteModel } from "../conto-corrente/conto-corrente.model";
import movimentoSrv from "../movimento/movimento.service";
import categoriaSrv from "../categoria/categoria.service";
import { IbanNotFoundError } from "../../errors/iban-not-found.error";
import { InsufficientBalanceError } from "../../errors/insufficient-balance.error";
import { Movimento } from "../movimento/movimento.entity";
import { CreateBonificoDto } from "./bonifico.dto";

export class BonificoService {
  async esegui(
    mittente: ContoCorrente,
    dto: CreateBonificoDto,
  ): Promise<Movimento> {
    const destinatario = await ContoCorrenteModel.findOne({
      iban: dto.iban,
    });
    if (!destinatario) {
      throw new IbanNotFoundError();
    }

    const saldoMittente = await movimentoSrv.getSaldoAttuale(mittente.id);
    if (saldoMittente < dto.importo) {
      throw new InsufficientBalanceError();
    }

    const categoriaUscita = await categoriaSrv.getByNome("Bonifico Uscita");
    const categoriaEntrata = await categoriaSrv.getByNome("Bonifico Entrata");
    if (!categoriaUscita || !categoriaEntrata) {
      throw new Error(
        'categorie "Bonifico Uscita"/"Bonifico Entrata" non trovate: hai lanciato npm run gen-data?',
      );
    }

    // dataEsecuzione è un'informazione del bonifico (quando l'utente
    // avrebbe voluto che avvenisse), NON il campo "data" reale del
    // movimento: quello resta sempre il momento in cui l'operazione
    // avviene davvero sul server (vedi movimento.service.ts)
    const dataEsecuzioneFormattata = new Date(
      dto.dataEsecuzione,
    ).toLocaleDateString("it-IT");

    // movimento in uscita sul conto del mittente
    const movimentoUscita = await movimentoSrv.create(mittente.id, {
      importo: dto.importo,
      categoriaMovimentoId: categoriaUscita.id,
      descrizioneEstesa: `Bonifico disposto a favore di ${dto.beneficiario} (${dto.iban}) - causale: ${dto.causale} - data esecuzione richiesta: ${dataEsecuzioneFormattata}`,
    });

    // movimento in entrata sul conto del destinatario
    await movimentoSrv.create(destinatario.id, {
      importo: dto.importo,
      categoriaMovimentoId: categoriaEntrata.id,
      descrizioneEstesa: `Bonifico disposto da ${mittente.nomeTitolare} ${mittente.cognomeTitolare} - causale: ${dto.causale}`,
    });

    return movimentoUscita;
  }
}

export default new BonificoService();
