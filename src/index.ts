import app from "./app";
import mongoose from "mongoose";
import { createServer } from "node:http";

const server = createServer(app);

mongoose.set("debug", true);
mongoose
  .connect("mongodb://localhost:27017/conti-correnti")
  .then(() => {
    server.listen(3000, "0.0.0.0", () => {
      console.log(`server listening on port 3000`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
