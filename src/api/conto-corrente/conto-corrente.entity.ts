// Rappresenta TContiCorrenti. La password NON è qui: è un campo interno
// del model (hashedPassword), mai esposto nelle risposte (rimosso dal
// toJSON transform in conto-corrente.model.ts).

export interface ContoCorrente {
  id: string;
  email: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  dataApertura: Date;
  iban?: string; // generato automaticamente in fase di registrazione (vedi conto-corrente.service.ts)
}
