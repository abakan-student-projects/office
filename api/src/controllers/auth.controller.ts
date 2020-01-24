import * as express from 'express'
import {NextFunction, Request, Response} from 'express'
import IControllerBase from 'interfaces/IControllerBase.interface'
import auth from "../middleware/auth";
import * as passport from "passport";
import User from "../models/User";

class AuthController implements IControllerBase {
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post(process.env.PATH_PREFIX + "/auth/create", auth.optional, (req: Request, res: Response, next: NextFunction) => {

            if(!req.body.email) {
                return res.status(422).json({
                    errors: {
                        email: 'is required',
                    },
                });
            }

            if(!req.body.password) {
                return res.status(422).json({
                    errors: {
                        password: 'is required',
                    },
                });
            }

            const finalUser = new User(req.body);
            finalUser.setPassword(req.body.password);

            return finalUser.save()
                .then(() => res.json({ user: finalUser.toAuthJSON() }));
        })

        this.router.post(process.env.PATH_PREFIX + "/auth/login", auth.optional, (req: Request, res: Response, next: NextFunction) => {
            if(!req.body.email) {
                return res.status(422).json({
                    errors: {
                        email: 'is required',
                    },
                });
            }

            if(!req.body.password) {
                return res.status(422).json({
                    errors: {
                        password: 'is required',
                    },
                });
            }

            return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
                if(err) {
                    return next(err);
                }

                if(passportUser) {
                    const user = passportUser;
                    user.token = passportUser.generateJWT();

                    return res.json({ user: user.toAuthJSON() });
                }

                return res.sendStatus(400);
            })(req, res, next);
        })

        this.router.get(process.env.PATH_PREFIX + "/auth/current", auth.required, (req: any, res: Response, next: NextFunction) => {
            const { payload: { id } } = req;

            return User.findByPk(id)
                .then((user) => {
                    if(!user) {
                        return res.sendStatus(400);
                    }

                    return res.json({ user: user.toAuthJSON() });
                });
        })
    }
}

export default AuthController