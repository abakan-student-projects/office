import * as express from 'express'
import {NextFunction, Request, Response} from 'express'
import IControllerBase from 'interfaces/IControllerBase.interface'
import OfficeData from "../OfficeData"
import path = require('path')

class DownloadController implements IControllerBase {
    public path = process.env.PATH_PREFIX + '/download/:workspace/contract.:type'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get(this.path, (req: Request, res: Response, next: NextFunction) => {
            const workspacePath = OfficeData.getWorkspacePath(req.params.workspace);
            res.sendFile(path.join(workspacePath, "output", "contract." + req.params.type));
        })
    }
}

export default DownloadController