export type TipoOperazione = 'login' | 'ricarica' | 'bonifico' | 'modifica-password';

export interface OperationLog {
  id: string;
  contoCorrente?: string; // assente se l'operazione fallisce prima di identificare l'utente (es. login con email inesistente)
  tipo: TipoOperazione;
  ip: string;
  data: Date;
  esito: boolean;
}
