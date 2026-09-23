export interface ContoCorrente {
  id: string;
  email: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  dataApertura: Date;
  iban?: string;
  fotoProfilo?: string; // url dell'immagine, opzionale: non tutti gli utenti la caricano
}
