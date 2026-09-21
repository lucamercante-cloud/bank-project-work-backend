import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';
import { ContoCorrenteModel } from "../../../api/conto-corrente/conto-corrente.model";
import * as bcrypt from 'bcrypt';

passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async function(email, password, done) {
    try {
      const account = await ContoCorrenteModel.findOne({ email });
      if (!account) {
        return done(null, false, { message: `email ${email} non trovata` });
      }

      const match = await bcrypt.compare(password, account.hashedPassword);
      if (!match) {
        return done(null, false, { message: 'password non valida' });
      }

      done(null, account.toObject());

    } catch(err) {
      done(err);
    }
  })
);
