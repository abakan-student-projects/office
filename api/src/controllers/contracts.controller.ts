import * as express from 'express'
import {NextFunction, Request, Response} from 'express'
import IControllerBase from '../interfaces/IControllerBase.interface'
import Contract from "../models/Contract";
import auth from "../middleware/auth";
import User from "../models/User";


class ContractsController implements IControllerBase {
    public path = process.env.PATH_PREFIX + '/contracts'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get(this.path + "/byPeriod/:period/:userId", auth.required, (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).payload;
            const userId = parseInt(req.params.userId);
            if (userId === user.id || user.isAdmin) {
                Contract.findOne({
                    where: {
                        periodId: req.params.period,
                        userId: userId
                    },
                    order: [["createdAt", "DESC"]]
                }).then(c => {
                    if (c) {
                        res.json({xml: c.xml})
                    } else {
                        res.sendStatus(404)
                    }
                }).error(e => {
                    res.sendStatus(500)
                })
            } else {
                res.sendStatus(401)
            }
        })

        this.router.get(this.path + "/byPeriodWithUsers/:period", auth.required, (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).payload;
            console.log(user);
            if (!user.isAdmin) {
                res.sendStatus(401)
                return
            }
            Contract.findAllLatestByPeriod(parseInt(req.params.period))
                .then(contracts => {
                    res.json(contracts.map((c) => {
                        return {
                            xml: c.xml,
                            user: {
                                id: c.user.id,
                                email: c.user.email
                            }
                        }
                    }))
                })
                .error(e => {
                    res.sendStatus(500)
                })
        })
    }
}

export default ContractsController