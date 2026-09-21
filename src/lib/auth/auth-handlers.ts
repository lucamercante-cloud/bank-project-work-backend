import { ContoCorrente } from "../../api/conto-corrente/conto-corrente.entity";
import './local/local-strategy';
import './jwt/jwt-strategy';

declare global {
  namespace Express {
    interface User extends ContoCorrente {

    }
  }
}
