import { Types } from "mongoose";
import { EmailExistsError } from "../../errors/email-exists.error";
import { NotFoundError } from "../../errors/not-found.error";
import { WrongPasswordError } from "../../errors/wrong-password.error";
import { ContoCorrente } from "./conto-corrente.entity";
import { ContoCorrenteModel } from "./conto-corrente.model";
import { generaIban } from "../../lib/iban";
import * as bcrypt from "bcrypt";

export class ContoCorrenteService {
  async register(
    data: Omit<ContoCorrente, "id" | "dataApertura" | "iban">,
    password: string,
  ): Promise<ContoCorrente> {
    const existing = await ContoCorrenteModel.findOne({ email: data.email });
    if (existing) {
      throw new EmailExistsError();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Pre-generiamo l'_id Mongo così possiamo calcolare l'IBAN (che si basa
    // sull'id dell'account) PRIMA della create, e salvare tutto in un colpo
    // solo. Prima l'IBAN veniva caricato a mano dopo la registrazione
    // (script set-iban.ts): ora è automatico.
    const newId = new Types.ObjectId();
    const iban = generaIban(newId.toHexString());

    const created = await ContoCorrenteModel.create({
      _id: newId,
      ...data,
      hashedPassword,
      dataApertura: new Date(),
      iban,
    });

    return created;
  }

  async updatePassword(
    accountId: string,
    vecchiaPassword: string,
    nuovaPassword: string,
  ): Promise<void> {
    const account = await ContoCorrenteModel.findById(accountId);
    if (!account) {
      throw new NotFoundError();
    }

    const match = await bcrypt.compare(vecchiaPassword, account.hashedPassword);
    if (!match) {
      throw new WrongPasswordError();
    }

    account.hashedPassword = await bcrypt.hash(nuovaPassword, 10);
    await account.save();
  }
}

export default new ContoCorrenteService();
