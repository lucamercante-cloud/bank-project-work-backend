import "dotenv/config"; // Carica le variabili dal file .env
import app from "./app";
import mongoose from "mongoose";
import { createServer } from "node:http";

const server = createServer(app);

const mongoUri = process.env.MONGO_URI;
const port = Number(process.env.PORT) || 3000;

if (!mongoUri) {
  console.error("ERRORE: MONGO_URI non è definita nel file .env");
  process.exit(1);
}

mongoose.set("debug", true);

mongoose
  .connect(mongoUri)
  .then(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Errore di connessione a MongoDB:", err);
  });