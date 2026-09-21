import { model, Schema } from "mongoose";
import { OperationLog } from "./operation-log.entity";

const operationLogSchema = new Schema<OperationLog>({
  contoCorrente: { type: Schema.Types.ObjectId, ref: 'ContoCorrente', required: false },
  tipo: { type: String, required: true, enum: ['login', 'ricarica', 'bonifico', 'modifica-password'] },
  ip: { type: String, required: true },
  data: { type: Date, required: true, default: () => new Date() },
  esito: { type: Boolean, required: true }
});

export const OperationLogModel = model<OperationLog>('OperationLog', operationLogSchema);
