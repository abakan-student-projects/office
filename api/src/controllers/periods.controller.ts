import * as express from 'express'
import {Request, Response} from 'express'
import IControllerBase from '../interfaces/IControllerBase.interface'
import Period from "../models/Period";
import auth from "../middleware/auth";


class PeriodsController implements IControllerBase {
    public path = '/periods'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get(this.path, auth.required,(req: Request, res: Response) => {
            const user = (req as any).payload;
            const where = (user.isAdmin) ? {} : { active: true }
            Period.findAll({
                where: where,
                order: [ ["name", "DESC"] ]
            }).then(data => {
                res.json(data.map(p => { return { id: p.id, name: p.name } }))
            });
        })
    }
}

export default PeriodsController