import { Categoria } from "./categoria.entity";
import { CategoriaModel } from "./categoria.model";

export class CategoriaService {

  async find(): Promise<Categoria[]> {
    return CategoriaModel.find();
  }

  // usato da movimento.service.ts per validare che la categoria esista
  // e per sapere se è di tipo Entrata o Uscita (serve al calcolo del saldo)
  async getById(id: string): Promise<Categoria | null> {
    return CategoriaModel.findById(id);
  }

  // usato da bonifico.service.ts e ricarica.service.ts per trovare la
  // categoria giusta senza dover conoscere il suo id in anticipow
  
  async getByNome(nomeCategoria: string): Promise<Categoria | null> {
    return CategoriaModel.findOne({ nomeCategoria });
  }
}

export default new CategoriaService();
