import { OperationLogModel } from "./operation-log.model";
import { TipoOperazione } from "./operation-log.entity";

export class OperationLogService {
  // "fire and forget": il chiamante fa await ma un fallimento nel log
  // non deve mai bloccare l'operazione principale già eseguita
  async log(
    tipo: TipoOperazione,
    ip: string,
    esito: boolean,
    contoCorrenteId?: string,
  ): Promise<void> {
    await OperationLogModel.create({
      tipo,
      ip,
      esito,
      contoCorrente: contoCorrenteId,
    });
  }
}

export default new OperationLogService();
