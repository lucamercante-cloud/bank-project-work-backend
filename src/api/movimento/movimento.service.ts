import { Movimento } from "./movimento.entity";
import { MovimentoModel } from "./movimento.model";
import { QueryMovimentoDto } from "./movimento.dto";
import categoriaSrv from "../categoria/categoria.service";

const DEFAULT_N = 10;

export class MovimentoService {

  async find(
    contoCorrenteId: string,
    filters: QueryMovimentoDto
  ): Promise<{ movimenti: Movimento[], saldoFinale?: number }> {

    const query: Record<string, any> = { contoCorrente: contoCorrenteId };

    if (filters.categoriaId) {
      query.categoriaMovimento = filters.categoriaId;
    }
    if (filters.dataInizio || filters.dataFine) {
      query.data = {};
      if (filters.dataInizio) query.data.$gte = new Date(filters.dataInizio);
      if (filters.dataFine) query.data.$lte = new Date(filters.dataFine);
    }

    const movimenti = await MovimentoModel.find(query)
      .sort({ data: -1 })
      .limit(filters.n ?? DEFAULT_N)
      .populate('categoriaMovimento');

    // il saldo finale ha senso solo nella vista "semplice" (RicercaMovimenti1):
    // appena filtri per categoria o per intervallo di date, il saldo del
    // conto NON è più legato a quella lista filtrata, quindi non lo torniamo
    // (coerente con la consegna: "Non visualizza il saldo finale")
    let saldoFinale: number | undefined = undefined;
    if (!filters.categoriaId && !filters.dataInizio && !filters.dataFine) {
      const ultimo = await MovimentoModel.findOne({ contoCorrente: contoCorrenteId })
        .sort({ data: -1 });
      saldoFinale = ultimo?.saldo ?? 0;
    }

    return { movimenti, saldoFinale };
  }

  async getById(contoCorrenteId: string, id: string): Promise<Movimento | null> {
    return MovimentoModel.findOne({ _id: id, contoCorrente: contoCorrenteId })
      .populate('categoriaMovimento');
  }

  // usato da bonifico/ricarica PRIMA di creare il movimento, per sapere
  // se il conto ha saldo sufficiente
  async getSaldoAttuale(contoCorrenteId: string): Promise<number> {
    const ultimo = await MovimentoModel.findOne({ contoCorrente: contoCorrenteId })
      .sort({ data: -1 });
    return ultimo?.saldo ?? 0;
  }

  // Uso INTERNO (non esposto da nessun controller/router): lo richiameranno
  // i moduli "bonifico"/"ricarica"/apertura conto per registrare un nuovo
  // movimento. Il saldo NON arriva mai dal client: si calcola qui.
  async create(
    contoCorrenteId: string,
    data: { importo: number, categoriaMovimentoId: string, descrizioneEstesa: string }
  ): Promise<Movimento> {

    const categoria = await categoriaSrv.getById(data.categoriaMovimentoId);
    if (!categoria) {
      throw new Error('categoria non valida');
    }

    const ultimo = await MovimentoModel.findOne({ contoCorrente: contoCorrenteId })
      .sort({ data: -1 });
    const saldoPrecedente = ultimo?.saldo ?? 0;

    const segno = categoria.tipologia === 'Entrata' ? 1 : -1;
    const nuovoSaldo = saldoPrecedente + (segno * data.importo);

    const movimento = await MovimentoModel.create({
      contoCorrente: contoCorrenteId,
      data: new Date(),
      importo: data.importo,
      saldo: nuovoSaldo,
      categoriaMovimento: data.categoriaMovimentoId,
      descrizioneEstesa: data.descrizioneEstesa
    });

    return movimento.populate('categoriaMovimento');
  }
}

export default new MovimentoService();
