# Guida alle API — Gestione Conti Correnti

Ogni sezione: **perché esiste** (con la frase della consegna), **come si chiama**, e **un esempio reale** di richiesta/risposta così chi legge vede esattamente cosa aspettarsi, non solo la teoria.

## Setup, una volta sola

1. `npm install`
2. `npm run gen-data` → console: `inserite 9 categorie`
3. Registrare almeno 2 utenti, impostare un IBAN a mano su entrambi (Compass/Atlas)

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

Nota: niente `password` nella risposta (rimossa apposta), e `id` è quello che userai ovunque da qui in poi per riferirti a questo conto.

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

---

## CONTO CORRENTE

**Perché**: pagina _"Profilo"_ (_"tutti i dati della TContiCorrenti"_) e home page (_"Benvenuto Mario Rossi"_).

```
GET http://localhost:3000/api/conto-corrente/me
```

**Risposta (200):** identica all'oggetto `user` del login qui sopra — stesso account, stessi campi.

**Test di errore**: senza header `Authorization` → **401**.

---

## CATEGORIA

**Perché**: _"Caricare delle CategorieMovimenti"_ — servono al frontend per il menu a tendina di RicercaMovimenti2.

```
GET http://localhost:3000/api/categorie
```

**Risposta (200), esempio parziale (ce ne sono 9 in tutto):**

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

Copia l'`id` di "Stipendio" (o un'altra a scelta): serve al prossimo test.

---

## MOVIMENTO

Prima, per avere dati veri da vedere, lanciate `npm run test-data -- mario.rossi@test.it` (crea 5 movimenti finti su quell'account). Con questi 5 movimenti, il saldo finale di Mario diventa **1510** (1500 stipendio − 80 utenze − 100 prelievo − 10 ricarica + 200 versamento).

### Lista semplice — RicercaMovimenti1

**Perché**: home page + _"visualizzare gli ultimi n movimenti... e il saldo finale del conto corrente"_.

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

Nota l'ordine: dal più recente al più vecchio (in cima "Versamento Bancomat", creato per ultimo). `saldoFinale` combacia col `saldo` del primo elemento — è normale, perché quello è cronologicamente l'ultimo movimento.

### Filtrata per categoria — RicercaMovimenti2

**Perché**: _"di una certa CategoriaMovimenti scelta dall'utente. Non visualizza il saldo finale"_.

```
GET http://localhost:3000/api/movimenti?n=10&categoriaId=6ab0aaa3
```

(usando l'id di "Pagamento Utenze")
**Risposta (200):**

```json
{
  "movimenti": [
    {
      "data": "2026-09-21T...",
      "importo": 80,
      "saldo": 1420,
      "categoriaMovimento": {
        "nomeCategoria": "Pagamento Utenze",
        "tipologia": "Uscita"
      },
      "descrizioneEstesa": "Bolletta luce",
      "id": "..."
    }
  ]
}
```

Il campo `saldoFinale` non compare proprio nel JSON — è la conferma che il filtro funziona come da consegna.

### Filtrata per date — RicercaMovimenti3

```
GET http://localhost:3000/api/movimenti?n=10&dataInizio=2026-01-01&dataFine=2026-12-31
```

Stessa forma di risposta della precedente (array + niente `saldoFinale`), ma filtrato per data invece che per categoria.

### Dettaglio — pagina DettaglioMovimento

```
GET http://localhost:3000/api/movimenti/<id_movimento>
```

(usa un `id` preso dall'array sopra)
**Risposta (200):** un singolo oggetto movimento, stessa forma di uno degli elementi dell'array — _"tutti i campi della TMovimentiContoCorrente"_.

### Test di errore

- `?categoriaId=xyz` → **400**: `{"error":"ValidationError","message":"categoriaId must be a mongodb id"}`
- `/movimenti/<id di un movimento di un altro utente>` → **404**: `{"error":"NotFound","message":"Entity not found"}`
- Nessun `POST /movimenti`: **non esiste**, i movimenti nascono solo da ricarica/bonifico/apertura conto.

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

**Risposta (201)** — partendo da saldo 1510, dopo la ricarica:

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

`operatore` valido solo tra `iliad`/`tim`/`vodafone`/`windtre`, `taglio` solo tra `5`/`10`/`20`/`30` — qualunque altro valore → **400** `ValidationError`.

**Test saldo insufficiente**: se il conto ha meno di 5€, prova comunque `taglio: 5` → **400**:

```json
{
  "error": "InsufficientBalance",
  "message": "saldo insufficiente per completare l'operazione"
}
```

---

## BONIFICO — walkthrough completo

**Perché**: _"Procedura per l'inserimento dell'IBAN del destinatario e importo bonifico. Va verificato che l'IBAN sia presente... Va verificato che ci sia saldo disponibile"_.

Partiamo da: Mario (mittente, saldo 1500 dopo la ricarica sopra) fa un bonifico di 50€ a Caleb (destinatario, IBAN `IT60X0542811101000000123457`, saldo attuale supponiamo 0).

**1. La chiamata (col token di Mario):**

```
POST http://localhost:3000/api/bonifici
```

```json
{
  "ibanDestinatario": "IT60X0542811101000000123457",
  "importo": 50
}
```

**Risposta (201)** — questo è il movimento sul conto del **mittente** (Mario):

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

**2. Verifica sul mittente (Mario):**

```
GET http://localhost:3000/api/movimenti?n=1
```

(col token di Mario) → in cima trovi lo stesso movimento di uscita appena visto, e `saldoFinale: 1450`.

**3. Verifica sul destinatario (Caleb)** — bisogna fare login con l'account di Caleb per avere il suo token:

```
GET http://localhost:3000/api/movimenti?n=1
```

(col token di Caleb) → risposta:

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

Questo è il punto chiave da far vedere al gruppo: **una** chiamata `POST /bonifici` ha creato **due** movimenti su **due conti diversi** — è la prova che il bonifico "sposta" davvero i soldi da un conto all'altro, non solo scrive un record isolato.

### Test di errore

- IBAN inventato (`"IT00X000..."`) → **400**:

```json
{ "error": "IbanNotFound", "message": "IBAN destinatario non trovato" }
```

- `importo` più alto del saldo disponibile → **400**:

```json
{
  "error": "InsufficientBalance",
  "message": "saldo insufficiente per completare l'operazione"
}
```

- `importo: -10` o `importo: 0` → **400** `ValidationError` (deve essere un numero positivo)

---

## Attenzione ai nomi dei campi in MongoDB

Se modificate documenti a mano (Compass/Atlas), sia il **nome** che il **valore** di ogni campo sono case-sensitive: `iban` e `IBAN` sono due campi diversi per MongoDB, non lo stesso campo scritto in due modi. Il nome nello schema è sempre minuscolo (`iban`); il valore invece va scritto tutto maiuscolo, seguendo lo standard IBAN vero.

---

## Cosa manca ancora rispetto alla consegna completa

Non implementati: email di conferma registrazione + movimento di apertura automatico, endpoint per caricare l'IBAN via API, modifica password, export CSV/Excel, log del login. Stesso schema a 6 livelli (entity → model → dto → service → controller → router) per ognuno, quando li affronterete.
