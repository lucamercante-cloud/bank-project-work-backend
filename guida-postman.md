# Guida alle API — Gestione Conti Correnti

Ogni sezione: **perché esiste** (con la frase della consegna), **come si chiama**, e **un esempio reale** di richiesta/risposta.

## Setup, una volta sola

1. `npm install`
2. `npm run gen-data` → console: `inserite 9 categorie`
3. Registrare almeno 2 utenti: l'IBAN viene generato automaticamente dalla WebApi in fase di registrazione, non serve nessun passaggio manuale (confermato ok dal prof)

---

## AUTH

**Perché**: _"Funzionalità di Registrazione"_ e _"Funzionalità di login"_ — senza, nessuno entra nell'app.

### Registrazione

```
POST http://localhost:3000/api/register
```

```json
{
  "email": "mario.rossi@test.it",
  "password": "Password1!",
  "confermaPassword": "Password1!",
  "nomeTitolare": "Mario",
  "cognomeTitolare": "Rossi",
  "fotoProfilo": "https://i.pravatar.cc/150?u=mario"
}
```

`fotoProfilo` è **opzionale** (url dell'immagine): se non la mandi, l'account viene creato comunque, semplicemente senza quel campo valorizzato.

**Risposta (201):**

```json
{
  "email": "mario.rossi@test.it",
  "nomeTitolare": "Mario",
  "cognomeTitolare": "Rossi",
  "dataApertura": "2026-09-21T10:43:00.218Z",
  "iban": "IT60X0542811101006ab10a34bbfc",
  "fotoProfilo": "https://i.pravatar.cc/150?u=mario",
  "id": "6ab10a34bbfcf94e3de407a7"
}
```

L'`iban` torna già valorizzato in questa risposta (generato automaticamente da `ContoCorrenteService.register`, a partire dall'id del nuovo account).

### Login

```
POST http://localhost:3000/api/login
```

```json
{ "email": "mario.rossi@test.it", "password": "Password1!" }
```

**Risposta (200):**

```json
{
  "user": {
    "email": "mario.rossi@test.it",
    "nomeTitolare": "Mario",
    "cognomeTitolare": "Rossi",
    "dataApertura": "2026-09-21T10:43:00.218Z",
    "iban": "IT60X0542811101006ab10a34bbfc",
    "fotoProfilo": "https://i.pravatar.cc/150?u=mario",
    "id": "6ab10a34bbfcf94e3de407a7"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Da qui in poi, **ogni** chiamata avrà nell'header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ogni tentativo di login (riuscito o no) scrive un record nella collezione `operationlogs` — _"Per ogni accesso memorizzare in una Tabella l'indirizzo IP, data/ora e se l'accesso è valido oppure no"_.

---

## CONTO CORRENTE

**Perché**: pagina _"Profilo"_ (_"tutti i dati della TContiCorrenti"_) e home page (_"Benvenuto Mario Rossi"_).

### Profilo

```
GET http://localhost:3000/api/conto-corrente/me
```

Header: `Authorization: Bearer <token>`
**Risposta (200):** identica all'oggetto `user` del login (con `fotoProfilo` se presente).

**Test di errore**: senza header `Authorization` → **401**.

### Modifica password

**Perché**: _"Modifica Password (ovviamente possibile solo se l'utente è loggato). Memorizzare in una Tabella l'indirizzo IP, data/ora e se l'operazione è andata a buon fine o meno"_.

```
PATCH http://localhost:3000/api/conto-corrente/password
```

Header: `Authorization: Bearer <token>`

```json
{
  "vecchiaPassword": "Password1!",
  "nuovaPassword": "NuovaPassword2!",
  "confermaNuovaPassword": "NuovaPassword2!"
}
```

**Risposta (204)**: nessun body.

**Test di errore**:
- `vecchiaPassword` sbagliata → **400** `WrongPassword`
- `nuovaPassword` diversa da `confermaNuovaPassword` → **400** `PasswordMismatch`
- `nuovaPassword` senza maiuscola/simbolo/8+ caratteri → **400** `ValidationError`
- Dopo il cambio, prova login con la **vecchia** password → **401**
- Controlla in `operationlogs`: record con `tipo: "modifica-password"`

---

## CATEGORIA

**Perché**: _"Caricare delle CategorieMovimenti"_.

```
GET http://localhost:3000/api/categorie
```

Header: `Authorization: Bearer <token>`

---

## MOVIMENTO

Per popolare dati veri: `npm run test-data -- mario.rossi@test.it`. Crea **10 movimenti** (come richiesto dalla consegna: *"caricare manualmente almeno 10 Movimenti per due conti correnti di test"*), il primo sempre `"Apertura Conto"` con importo/saldo 0. **Ripeti il comando con una seconda email** (un secondo account registrato), la consegna ne vuole due.

### Lista semplice — RicercaMovimenti1

```
GET http://localhost:3000/api/movimenti?n=5
```

**Risposta (200):**

```json
{
  "movimenti": [ /* ultimi 5, dal più recente */ ],
  "saldoFinale": 3345
}
```

### Filtrata per categoria — RicercaMovimenti2

```
GET http://localhost:3000/api/movimenti?n=10&categoriaId=6ab0aaa3
```

Array filtrato, niente `saldoFinale`.

### Filtrata per date — RicercaMovimenti3

```
GET http://localhost:3000/api/movimenti?n=10&dataInizio=2026-01-01&dataFine=2026-12-31
```

### Dettaglio

```
GET http://localhost:3000/api/movimenti/<id_movimento>
```

### Export CSV

```
GET http://localhost:3000/api/movimenti/export?n=10
```

Su Postman: **"Send and Download"**, non "Send", altrimenti il CSV compare come testo grezzo invece di scaricarsi.

### Test di errore
- `?categoriaId=xyz` → **400** `ValidationError`
- `/movimenti/<id di un movimento di un altro utente>` → **404**
- senza `Authorization` → **401**
- Nessun `POST /movimenti` diretto: nascono solo da ricarica/bonifico/apertura conto.

---

## RICARICA

```
POST http://localhost:3000/api/ricariche
```

```json
{
  "numeroTelefono": "3331234567",
  "operatore": "iliad",
  "taglio": 10
}
```

`operatore`: `iliad`/`tim`/`vodafone`/`windtre`. `taglio`: `5`/`10`/`20`/`30`.

**Test saldo insufficiente** → **400** `InsufficientBalance`.

---

## BONIFICO — walkthrough completo

**Perché**: _"Va verificato che l'IBAN sia presente... Va verificato che ci sia saldo disponibile"_.

**1. La chiamata (col token di Mario, mittente):**

```
POST http://localhost:3000/api/bonifici
```

```json
{
  "beneficiario": "Caleb Frimpong",
  "importo": 50,
  "iban": "IT60X0542811101000000123457",
  "causale": "Aiuto Codice",
  "dataEsecuzione": "2026-09-23T10:00:00.000Z"
}
```

Campi: `beneficiario` (nome di chi riceve, solo informativo — finisce nella descrizione del movimento, **non** viene incrociato con l'intestatario reale del conto destinatario), `iban` (del destinatario), `causale` (motivo, finisce anche lui in descrizione), `dataEsecuzione` (data ISO — **anche questa solo informativa**, vedi nota sotto).

**Risposta (201)** — movimento sul conto del **mittente**:

```json
{
  "data": "2026-09-23T15:04:12.331Z",
  "importo": 50,
  "saldo": 1450,
  "categoriaMovimento": { "nomeCategoria": "Bonifico Uscita", "tipologia": "Uscita" },
  "descrizioneEstesa": "Bonifico disposto a favore di Caleb Bianchi (IT60X0542811101000000123457) - causale: Rimborso cena - data esecuzione richiesta: 23/9/2026",
  "id": "6ab3..."
}
```

**Nota importante — perché `data` non è uguale a `dataEsecuzione`**: il campo `data` del movimento è quello che regola l'ordinamento (`GET /movimenti` mostra sempre "gli ultimi n" per data decrescente) e il calcolo a catena del saldo (ogni movimento nuovo parte dal saldo dell'ultimo per data). Se `dataEsecuzione` (scelta liberamente dall'utente, anche nel passato) sovrascrivesse `data`, un bonifico con una data "vecchia" sparirebbe dalla lista degli "ultimi movimenti" pur essendo stato appena creato, e potrebbe alterare il calcolo del saldo degli altri movimenti. Per questo `data` resta **sempre** il momento reale in cui l'operazione avviene sul server, mentre `dataEsecuzione` viene solo registrata come testo dentro `descrizioneEstesa`.

**2. Verifica sul destinatario (Caleb, col suo token):**

```
GET http://localhost:3000/api/movimenti?n=1
```

```json
{
  "movimenti": [
    {
      "data": "2026-09-23T15:04:12.331Z",
      "importo": 50,
      "saldo": 50,
      "categoriaMovimento": { "nomeCategoria": "Bonifico Entrata", "tipologia": "Entrata" },
      "descrizioneEstesa": "Bonifico disposto da Mario Rossi - causale: Rimborso cena",
      "id": "6ab4..."
    }
  ],
  "saldoFinale": 50
}
```

**Una** chiamata `POST /bonifici` crea **due** movimenti su **due conti diversi**, entrambi con `data` = adesso, e compaiono subito in cima a `GET /movimenti` per entrambi gli utenti.

### Test di errore
- IBAN inventato (campo `iban`) → **400** `IbanNotFound`
- saldo insufficiente → **400** `InsufficientBalance`
- `importo` negativo o zero → **400** `ValidationError`
- `dataEsecuzione` non in formato data ISO → **400** `ValidationError`
- `beneficiario` o `causale` vuoti → **400** `ValidationError`

---

## Attenzione ai nomi dei campi in MongoDB

Se modificate documenti a mano (Compass/Atlas), sia il **nome** che il **valore** di ogni campo sono case-sensitive. Nome sempre minuscolo (`iban`); valore tutto maiuscolo.

---

## Cosa manca ancora rispetto alla consegna completa

Non implementato: email di conferma registrazione + movimento di apertura automatico (in sospeso, servono decisioni di gruppo prima di scriverlo). Fuori dal codice: pubblicazione online dell'app.

---

## Changelog per il gruppo

**IBAN ora automatico (non più a mano).** Confermato ok dal prof. `POST /api/register` restituisce direttamente l'`iban`, generato dentro `ContoCorrenteService.register()` tramite `src/lib/iban.ts`. Script `set-iban.ts` non serve più.

**Bonifico: nuovi campi nel body.** `ibanDestinatario` → rinominato `iban`. Aggiunti `beneficiario`, `causale`, `dataEsecuzione` (tutti obbligatori).

**FIX di oggi — bug "il bonifico non appare nella lista movimenti".** Causa: `dataEsecuzione` sovrascriveva il campo `data` reale del movimento, quindi un bonifico testato con una data non recente finiva "in fondo" all'ordinamento e spariva dagli "ultimi n movimenti". Corretto: `data` resta sempre il momento reale dell'operazione sul server; `dataEsecuzione` è ora solo testo dentro `descrizioneEstesa`. File toccati: `movimento.service.ts` (rimosso il parametro `dataMovimento` da `create()`), `bonifico.service.ts` (non passa più una data custom, la formatta e la mette in descrizione).

**Aggiunto `fotoProfilo`.** Nuovo campo opzionale (url stringa) su `RegisterDto`, entity e model di `ContoCorrente`. Torna in ogni risposta che espone il profilo utente (register, login, `/me`).

**`test-data.ts` aggiornato**: ora crea 10 movimenti (non 5), il primo è sempre `"Apertura Conto"` con importo 0 — per rispettare alla lettera *"caricare manualmente almeno 10 Movimenti per due conti correnti di test: il primo movimento deve avere come Descrizione Estesa 'Apertura Conto'"*. Ricordatevi di lanciarlo per **due** account distinti, non uno solo.
