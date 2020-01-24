import * as express from 'express'
import { Application } from 'express'
import { Sequelize } from "sequelize";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import User from "./models/User";

class App {
    public app: Application
    public port: number

    constructor(appInit: { port: number; middleWares: any; controllers: any; }) {
        this.app = express()
        this.port = appInit.port

        this.middlewares(appInit.middleWares)
        this.routes(appInit.controllers)
        this.assets()

        passport.use(new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            (email, password, done) => {
                User.findOne({ where: { email: email } })
                    .then((user) => {
                        if(!user || !user.validatePassword(password)) {
                            return done(null, false, { message: 'email or password is invalid' });
                        }
                        return done(null, user);
                    }).catch(done);
            }
        ))
    }

    private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
        middleWares.forEach(middleWare => {
            this.app.use(middleWare)
        })
    }

    private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
        controllers.forEach(controller => {
            this.app.use('/', controller.router)
        })
    }

    private assets() {
        this.app.use(express.static('public'))
    }


    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`)
        })
    }
}

export default App