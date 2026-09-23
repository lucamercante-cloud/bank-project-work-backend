import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { QueryMovimentoDto } from "./movimento.dto";
import { IdParams } from "../../lib/id-params";
import movimentoSrv from "./movimento.service";
import { NotFoundError } from "../../errors/not-found.error";

export const list = async (
  req: TypedRequest<unknown, QueryMovimentoDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { movimenti, saldoFinale } = await movimentoSrv.find(
      req.user!.id,
      req.query,
    );
    res.json({ movimenti, saldoFinale });
  } catch (err) {
    next(err);
  }
};

export const detail = async (
  req: TypedRequest<unknown, unknown, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const movimento = await movimentoSrv.getById(req.user!.id, req.params.id);
    if (!movimento) {
      throw new NotFoundError();
    }
    res.json(movimento);
  } catch (err) {
    next(err);
  }
};

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export const exportCsv = async (
  req: TypedRequest<unknown, QueryMovimentoDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { movimenti } = await movimentoSrv.find(req.user!.id, req.query);

    const header = [
      "Data",
      "Importo",
      "Categoria",
      "DescrizioneEstesa",
      "Saldo",
    ].join(",");

    const rows = movimenti.map((m: any) => {
      const data = new Date(m.data).toISOString();
      const categoria =
        typeof m.categoriaMovimento === "object"
          ? m.categoriaMovimento.nomeCategoria
          : "";
      return [
        data,
        m.importo,
        escapeCsvField(categoria),
        escapeCsvField(m.descrizioneEstesa),
        m.saldo,
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="movimenti.csv"',
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
