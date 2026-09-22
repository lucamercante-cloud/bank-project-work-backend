// Genera un IBAN "finto" ma univoco e deterministico a partire dall'id
// dell'account: stessa logica che prima stava in set-iban.ts (script
// manuale), ora richiamata direttamente in fase di registrazione.
// Non è un IBAN calcolato con l'algoritmo reale (checksum ecc.): per
// questo esercizio basta che sia univoco e abbia la forma giusta.
export function generaIban(accountId: string): string {
  const numerico = accountId
    .split("")
    .map((c) => (/[a-f]/.test(c) ? (c.charCodeAt(0) - 96).toString() : c))
    .join("")
    .slice(-12)
    .padStart(12, "0");

  return `IT60X0542811101${numerico}`;
}
