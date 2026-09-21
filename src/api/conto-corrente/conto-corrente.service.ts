import { EmailExistsError } from "../../errors/email-exists.error";
import { ContoCorrente } from "./conto-corrente.entity";
import { ContoCorrenteModel } from "./conto-corrente.model";
import * as bcrypt from 'bcrypt';

export class ContoCorrenteService {

  async register(
    data: Omit<ContoCorrente, 'id' | 'dataApertura' | 'iban'>,
    password: string
  ): Promise<ContoCorrente> {

    const existing = await ContoCorrenteModel.findOne({ email: data.email });
    if (existing) {
      throw new EmailExistsError();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await ContoCorrenteModel.create({
      ...data,
      hashedPassword,
      dataApertura: new Date()
    });

    // TODO (parte "api", esclusa qui): a questo punto andrebbe inviata
    // la mail di conferma registrazione, e solo dopo la conferma
    // andrebbe creato il primo movimento in TMovimentiContoCorrente
    // (descrizioneEstesa: "Apertura Conto", importo: 0, saldo: 0).
    // Per ora l'account viene creato direttamente, attivo da subito.

    return created;
  }
}

export default new ContoCorrenteService();
