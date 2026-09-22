# Guida alle API — Gestione Conti Correnti

Ogni sezione: **perché esiste** (con la frase della consegna), **come si chiama**, e **un esempio reale** di richiesta/risposta.

## Setup, una volta sola

1. `npm install`
2. `npm run gen-data` → console: `inserite 9 categorie`
3. Registrare almeno 2 utenti, impostare un IBAN a mano su entrambi (`npm run set-iban` oppure a mano su Compass/Atlas)

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
  "cognomeTitolare": "Rossi"
}
```

**Risposta (201):**

```json
{
  "email": "mario.rossi@test.it",
  "nomeTitolare": "Mario",
  "cognomeTitolare": "Rossi",
  "dataApertura": "2026-09-21T10:43:00.218Z",
  "id": "6ab10a34bbfcf94e3de407a7"
}
```

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
    "id": "6ab10a34bbfcf94e3de407a7"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Da qui in poi, **ogni** chiamata avrà nell'header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Novità**: ogni tentativo di login (riuscito o no) scrive ora un record nella collezione `operationlogs` — _"Per ogni accesso memorizzare in una Tabella l'indirizzo IP, data/ora e se l'accesso è valido oppure no"_. Verificalo su Compass/Atlas dopo un login: dovresti vedere `{ tipo: "login", ip: "...", esito: true, data: "..." }`. Prova anche un login con password sbagliata e controlla che compaia un secondo record con `esito: false`.

---

## CONTO CORRENTE

**Perché**: pagina _"Profilo"_ (_"tutti i dati della TContiCorrenti"_) e home page (_"Benvenuto Mario Rossi"_).

### Profilo

```
GET http://localhost:3000/api/conto-corrente/me
```

Header: `Authorization: Bearer <token>`
**Risposta (200):** identica all'oggetto `user` del login.

**Test di errore**: senza header `Authorization` → **401**.

### Modifica password (nuovo)

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

**Risposta (204)**: nessun body, solo lo status "No Content" — significa che è andata bene.

**Test di errore**:

- `vecchiaPassword` sbagliata → **400**:

```json
{ "error": "WrongPassword", "message": "password attuale non corretta" }
```

- `nuovaPassword` diversa da `confermaNuovaPassword` → **400** `PasswordMismatch`
- `nuovaPassword` senza maiuscola/simbolo/8+ caratteri → **400** `ValidationError`
- Dopo il cambio, prova a fare login con la **vecchia** password → **401** (conferma che il cambio è avvenuto per davvero)
- Controlla in `operationlogs`: nuovo record con `tipo: "modifica-password"`

---

## CATEGORIA

**Perché**: _"Caricare delle CategorieMovimenti"_ — servono al frontend per il menu a tendina di RicercaMovimenti2.

```
GET http://localhost:3000/api/categorie
```

Header: `Authorization: Bearer <token>`
**Risposta (200), esempio parziale:**

```json
[
  {
    "nomeCategoria": "Apertura Conto",
    "tipologia": "Entrata",
    "id": "6ab0aaa1..."
  },
  {
    "nomeCategoria": "Bonifico Entrata",
    "tipologia": "Entrata",
    "id": "6ab0aaa2..."
  },
  {
    "nomeCategoria": "Bonifico Uscita",
    "tipologia": "Uscita",
    "id": "6ab0aaa3..."
  },
  { "nomeCategoria": "Stipendio", "tipologia": "Entrata", "id": "6ab0aaa8..." }
]
```

---

## MOVIMENTO

Prima, per avere dati veri: `npm run test-data -- mario.rossi@test.it` (crea 5 movimenti finti). Saldo risultante: **1510** (1500 stipendio − 80 utenze − 100 prelievo − 10 ricarica + 200 versamento).

### Lista semplice — RicercaMovimenti1

```
GET http://localhost:3000/api/movimenti?n=5
```

**Risposta (200):**

```json
{
  "movimenti": [
    {
      "data": "2026-09-21T...",
      "importo": 200,
      "saldo": 1510,
      "categoriaMovimento": {
        "nomeCategoria": "Versamento Bancomat",
        "tipologia": "Entrata",
        "id": "..."
      },
      "descrizioneEstesa": "Versamento contanti",
      "id": "..."
    },
    {
      "data": "2026-09-21T...",
      "importo": 10,
      "saldo": 1310,
      "categoriaMovimento": {
        "nomeCategoria": "Ricarica Telefonica",
        "tipologia": "Uscita",
        "id": "..."
      },
      "descrizioneEstesa": "Ricarica iliad",
      "id": "..."
    },
    {
      "data": "2026-09-21T...",
      "importo": 100,
      "saldo": 1320,
      "categoriaMovimento": {
        "nomeCategoria": "Prelievo Contanti",
        "tipologia": "Uscita",
        "id": "..."
      },
      "descrizioneEstesa": "Prelievo sportello",
      "id": "..."
    },
    {
      "data": "2026-09-21T...",
      "importo": 80,
      "saldo": 1420,
      "categoriaMovimento": {
        "nomeCategoria": "Pagamento Utenze",
        "tipologia": "Uscita",
        "id": "..."
      },
      "descrizioneEstesa": "Bolletta luce",
      "id": "..."
    },
    {
      "data": "2026-09-21T...",
      "importo": 1500,
      "saldo": 1500,
      "categoriaMovimento": {
        "nomeCategoria": "Stipendio",
        "tipologia": "Entrata",
        "id": "..."
      },
      "descrizioneEstesa": "Stipendio mensile",
      "id": "..."
    }
  ],
  "saldoFinale": 1510
}
```

### Filtrata per categoria — RicercaMovimenti2

```
GET http://localhost:3000/api/movimenti?n=10&categoriaId=6ab0aaa3
```

**Risposta (200):** array filtrato, niente `saldoFinale`.

### Filtrata per date — RicercaMovimenti3

```
GET http://localhost:3000/api/movimenti?n=10&dataInizio=2026-01-01&dataFine=2026-12-31
```

Stessa forma, filtrato per data.

### Dettaglio

```
GET http://localhost:3000/api/movimenti/<id_movimento>
```

### Export CSV (nuovo)

**Perché**: richiesto in tutte e 3 le RicercaMovimenti — _"Possibilità di esportazione dei movimenti in formato excel oppure csv"_.

```
GET http://localhost:3000/api/movimenti/export?n=10
```

Accetta **gli stessi filtri** di `GET /movimenti` (`categoriaId`, `dataInizio`, `dataFine`).

**Su Postman**: non premere "Send" ma la freccetta accanto e scegli **"Send and Download"**, altrimenti il contenuto CSV ti compare come testo grezzo nella risposta invece di scaricarsi come file.

**Risposta**: un file `movimenti.csv`, contenuto tipo:

```csv
Data,Importo,Categoria,DescrizioneEstesa,Saldo
2026-09-21T14:32:10.000Z,200,"Versamento Bancomat","Versamento contanti",1510
2026-09-21T14:31:05.000Z,10,"Ricarica Telefonica","Ricarica iliad",1310
```

Apribile direttamente con Excel/LibreOffice/Google Sheets.

### Test di errore (validi per tutti gli endpoint di movimento)

- `?categoriaId=xyz` → **400** `ValidationError`
- `/movimenti/<id di un movimento di un altro utente>` → **404**
- senza `Authorization` → **401**
- Nessun `POST /movimenti` diretto: i movimenti nascono solo da ricarica/bonifico/apertura conto.

---

## RICARICA

**Perché**: _"L'utente deve inserire: numero telefonico, operatore... e del taglio della ricarica... Va prima verificato che ci sia saldo disponibile"_.

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

**Risposta (201):**

```json
{
  "data": "2026-09-21T...",
  "importo": 10,
  "saldo": 1500,
  "categoriaMovimento": {
    "nomeCategoria": "Ricarica Telefonica",
    "tipologia": "Uscita"
  },
  "descrizioneEstesa": "Ricarica iliad numero 3331234567 - taglio €10",
  "id": "6ab2..."
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
  "ibanDestinatario": "IT60X0542811101000000123457",
  "importo": 50
}
```

**Risposta (201)** — movimento sul conto del **mittente**:

```json
{
  "data": "2026-09-21T...",
  "importo": 50,
  "saldo": 1450,
  "categoriaMovimento": {
    "nomeCategoria": "Bonifico Uscita",
    "tipologia": "Uscita"
  },
  "descrizioneEstesa": "Bonifico disposto a favore di IT60X0542811101000000123457",
  "id": "6ab3..."
}
```

**2. Verifica sul destinatario (Caleb, col suo token):**

```
GET http://localhost:3000/api/movimenti?n=1
```

```json
{
  "movimenti": [
    {
      "data": "2026-09-21T...",
      "importo": 50,
      "saldo": 50,
      "categoriaMovimento": {
        "nomeCategoria": "Bonifico Entrata",
        "tipologia": "Entrata"
      },
      "descrizioneEstesa": "Bonifico disposto da Mario Rossi",
      "id": "6ab4..."
    }
  ],
  "saldoFinale": 50
}
```

**Una** chiamata `POST /bonifici` crea **due** movimenti su **due conti diversi**.

### Test di errore

- IBAN inventato → **400** `IbanNotFound`
- saldo insufficiente → **400** `InsufficientBalance`
- `importo` negativo o zero → **400** `ValidationError`

---

## Attenzione ai nomi dei campi in MongoDB

Se modificate documenti a mano (Compass/Atlas), sia il **nome** che il **valore** di ogni campo sono case-sensitive: `iban` e `IBAN` sono due campi diversi per MongoDB. Nome sempre minuscolo (`iban`); valore tutto maiuscolo (standard IBAN vero).

---

## Cosa manca ancora rispetto alla consegna completa

Non implementato: email di conferma registrazione + movimento di apertura automatico (in sospeso, servono decisioni di gruppo prima di scriverlo — vedi se bloccare o no il login finché l'utente non conferma).
