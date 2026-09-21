import movimentoSrv from "../movimento/movimento.service";
import categoriaSrv from "../categoria/categoria.service";
import { InsufficientBalanceError } from "../../errors/insufficient-balance.error";
import { Movimento } from "../movimento/movimento.entity";

export class RicaricaService {

  async esegui(
    contoCorrenteId: string,
    numeroTelefono: string,
    operatore: string,
    taglio: number
  ): Promise<Movimento> {

    const saldo = await movimentoSrv.getSaldoAttuale(contoCorrenteId);
    if (saldo < taglio) {
      throw new InsufficientBalanceError();
    }

    const categoria = await categoriaSrv.getByNome('Ricarica Telefonica');
    if (!categoria) {
      throw new Error('categoria "Ricarica Telefonica" non trovata: hai lanciato npm run gen-data?');
    }

    return movimentoSrv.create(contoCorrenteId, {
      importo: taglio,
      categoriaMovimentoId: categoria.id,
      descrizioneEstesa: `Ricarica ${operatore} numero ${numeroTelefono} - taglio €${taglio}`
    });
  }
}

export default new RicaricaService();
