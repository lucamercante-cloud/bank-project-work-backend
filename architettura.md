# Architettura backend — Gestione Conti Correnti

Stack: Node.js + TypeScript + Express + MongoDB (Mongoose) + Passport (JWT + local strategy).

## Struttura del progetto

```
conti-correnti-api/
├── package.json                        dipendenze e script (npm run dev)
├── tsconfig.json                       configurazione del compilatore TypeScript
│
└── src/
    ├── index.ts                        entry point: connette a MongoDB e avvia il server
    ├── app.ts                          crea l'app Express, collega router e gestori errori
    │
    ├── lib/                            infrastruttura trasversale, riusabile in ogni modulo
    │   ├── typed-request.interface.ts  tipizza req.body/query/params in ogni controller
    │   ├── id-params.ts                DTO per validare gli :id nelle rotte (deve essere un ObjectId Mongo valido)
    │   ├── validation-middleware.ts    middleware che valida body/query/params contro un DTO prima di eseguire il controller
    │   └── auth/
    │       ├── auth-handlers.ts        registra le strategie passport, estende il tipo Express.User
    │       ├── authenticated.middleware.ts   middleware che blocca le richieste senza JWT valido
    │       ├── jwt/
    │       │   └── jwt-strategy.ts     verifica il token JWT e recupera l'account da MongoDB
    │       └── local/
    │           └── local-strategy.ts   verifica email/password al login, confronta l'hash con bcrypt
    │
    ├── errors/                         gestione centralizzata degli errori
    │   ├── index.ts                    aggrega tutti gli error handler in un unico array (usato in app.ts)
    │   ├── generic.ts                  errore generico non gestito -> risposta 500
    │   ├── validation-error.ts         errore di validazione DTO -> risposta 400 con i dettagli dei campi
    │   ├── not-found.error.ts          risorsa non trovata -> risposta 404
    │   ├── email-exists.error.ts       email già registrata -> risposta 400
    │   └── password-mismatch.error.ts  password e confermaPassword diverse -> risposta 400
    │
    └── api/
        ├── routes.ts                   router principale: smista le richieste ai router dei singoli moduli
        │
        ├── auth/                       registrazione e login (rotte pubbliche, nessun JWT richiesto)
        │   ├── auth.dto.ts             RegisterDto (email, password, confermaPassword, nomeTitolare, cognomeTitolare) e LoginDto
        │   ├── auth.controller.ts      logica di register (crea l'account) e login (genera il JWT)
        │   └── auth.router.ts          espone POST /register e POST /login
        │
        └── conto-corrente/             il conto corrente dell'utente (TContiCorrenti)
            ├── conto-corrente.entity.ts    interfaccia TypeScript: forma del dato "conto corrente" esposto dalle API
            ├── conto-corrente.model.ts     schema Mongoose: come il conto corrente è salvato su MongoDB
            ├── conto-corrente.service.ts   logica di creazione account (hash password, controllo email duplicata)
            ├── conto-corrente.controller.ts   handler HTTP: GET /me risponde con il profilo dell'utente loggato
            └── conto-corrente.router.ts    espone GET /me (protetta da JWT)
```

## I livelli dell'architettura, spiegati in generale

Ogni "risorsa" del dominio (conto corrente, e in futuro movimento, categoria, bonifico...) segue sempre questi 6 livelli, in quest'ordine di dipendenza:

1. **entity** — *cos'è* il dato: solo l'interfaccia TypeScript, zero logica. È il contratto: che campi ha, con che tipo.
2. **model** — *come si salva* nel database: lo schema Mongoose, che mappa l'entity su una collezione MongoDB. Qui vivono anche i campi "interni" (es. `hashedPassword`) che non fanno parte dell'entity pubblica, e la trasformazione che pulisce l'output (`_id` → `id`, rimozione di `__v` e dei campi sensibili).
3. **dto** *(quando serve validare input)* — *cosa può mandarmi il client* ed è considerato valido: regole di validazione su body, query o params.
4. **service** — *la logica*: le funzioni che parlano col model (creare, cercare, aggiornare, cancellare). Nessun riferimento a Express qui dentro: solo dati e regole di dominio.
5. **controller** — *il ponte* fra HTTP e service: legge la `req`, chiama il service, risponde con `res.json(...)`, gestisce gli errori con `try/catch` + `next(err)`.
6. **router** — *gli indirizzi*: collega ogni URL/metodo HTTP al controller giusto, inserendo nel mezzo i middleware necessari (autenticazione, validazione).

Il motivo di quest'ordine: ogni livello dipende solo da quello prima di lui. Il model ha bisogno dell'entity per essere tipizzato, il controller ha bisogno del service per avere una logica da chiamare, e così via — costruirli in quest'ordine evita di dover tornare indietro a modificare pezzi già scritti.

## Come si intrecciano `auth` e `conto-corrente`

`auth` **non ha un proprio model**: si appoggia a `ContoCorrenteModel` (definito in `conto-corrente/`) sia per creare il nuovo account in fase di `register` (tramite `ContoCorrenteService.register(...)`), sia per verificare le credenziali in fase di `login` (tramite `local-strategy.ts`, che interroga `ContoCorrenteModel` direttamente). È per questo che `conto-corrente.service.ts` esiste già anche se, per ora, ha un solo metodo (`register`): è la base logica su cui si appoggia tutta l'autenticazione, prima ancora di avere rotte CRUD proprie.

## Moduli ancora da scrivere (di gruppo)

Non fanno ancora parte del progetto, li aggiungerete seguendo lo stesso schema a 6 livelli:

- **movimento** (`TMovimentiContoCorrente`) — entity con `contoCorrenteId`, `data`, `importo`, `saldo`, `categoriaMovimentoId`, `descrizioneEstesa`; la parte più delicata è calcolare il nuovo `saldo` a ogni movimento a partire da quello precedente
- **categoria** (`TCategorieMovimenti`) — entity con `nomeCategoria`, `tipologia` (`'Entrata' | 'Uscita'`), più uno script di seed per caricare le categorie iniziali (come `gen-data.ts` nel progetto pokemon)
- **bonifico** — verifica IBAN esistente + saldo disponibile, crea un movimento di uscita sul conto mittente e uno di entrata sul conto destinatario
- **ricarica** — verifica saldo disponibile, crea un movimento di uscita
- endpoint di ricerca movimenti (per numero, per categoria, per intervallo di date) ed esportazione CSV/Excel
