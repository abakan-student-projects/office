import * as express from 'express'
import {NextFunction, Request, response, Response} from 'express'
import IControllerBase from 'interfaces/IControllerBase.interface'
import OfficeData from "../OfficeData"
import multer = require('multer')
import fs = require("fs")
import archiver = require("archiver")
import { DOMParser as dom } from 'xmldom';
import * as xpath from 'xpath-ts';
import streamBuffers = require('stream-buffers');

import GenerationDocumentType from "../GenerationDocumentType";
import OfficeTools from "../OfficeTools";
import GeneratorResponse from "../../../shared/GeneratorResponse"
import auth from "../middleware/auth";
import Period from "../models/Period";
import Contract from "../models/Contract";

const upload = multer()

class GeneratorController implements IControllerBase {
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post(process.env.PATH_PREFIX + '/generate/:period/:userId', auth.required, upload.none(), this.post)
        this.router.get(process.env.PATH_PREFIX + '/generateAllContractsByPeriod/:period', auth.required, this.getAllContractsByPeriod)
    }

    getAllContractsByPeriod = (req: Request, res: Response) => {
        let user = (req as any).payload;
        if (!user.isAdmin) {
            res.sendStatus(401)
            return
        }
        Period.findByPk(req.params.period)
            .then(period => {
                Contract.findAllLatestByPeriod(parseInt(req.params.period))
                    .then(contracts =>  {
                        const workspacePaths = Promise.all(
                            contracts.map(
                                contract => new Promise((resolve, reject) => {
                                    const [ workspace, workspacePath ] = OfficeData.createWorkspace(period.path, (err) => {
                                        if (err) {
                                            resolve(null)
                                        } else {
                                            fs.writeFileSync(workspacePath + "/output/contract.xml", contract.xml);
                                            this.generate(workspacePath)
                                                .then((output) => {
                                                    resolve(workspacePath)
                                                })
                                                .catch(e => { resolve(null)})
                                        }
                                    })
                        })))
                        workspacePaths.then(paths => {
                            const archiveStream = new streamBuffers.WritableStreamBuffer({
                                initialSize: (100 * 1024),   // start at 100 kilobytes.
                                incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
                            })
                            const archive = archiver("zip")
                            archive.pipe(archiveStream)
                            paths.forEach(p => {
                                if (fs.existsSync(p + "/output/contract.pdf")) {
                                    const doc = new dom().parseFromString(fs.readFileSync(p + "/output/contract.xml").toString())
                                    const name = xpath.select("/contract/identification/title", doc)[0].firstChild.data
                                    archive.append(
                                        fs.createReadStream(p + "/output/contract.docx"),
                                        {name: name + " " + period.name + ".docx"});
                                }
                            })
                            archive.finalize()
                                .then(() => {
                                    archiveStream.end(() => {
                                        const buffer = archiveStream.getContents()
                                        if (buffer) {
                                            res.writeHead(200, {
                                                'Content-Type': "application/zip",
                                                'Content-disposition': 'attachment;filename=contracts.zip',
                                                'Content-Length': buffer.length
                                            })
                                            res.end(buffer, "binary")
                                        }
                                    })
                                })
                        })
                    })
                    .catch(e => {
                        res.sendStatus(500)
                    })
            })
            .catch(e => {
                res.sendStatus(500)
            })
    }

    post = (req: Request, res: Response, next: NextFunction) => {
        let user = (req as any).payload;
        let contractBuffer = new Buffer(req.body.contract, "base64")
        const userId = req.params.userId

        if (user.id != userId && !user.isAdmin) {
            res.sendStatus(401)
            return
        }

        Period.findByPk(req.params.period)
            .then(period => {
                Contract.findOne({
                    where: { periodId: period.id, userId: userId },
                    order: [ ["createdAt", "DESC"] ]
                }).then(prevContract => {
                    if (!prevContract || prevContract.xml != contractBuffer.toString()) {
                        let contract = new Contract();
                        contract.periodId = period.id;
                        contract.userId = parseInt(userId);
                        contract.xml = contractBuffer.toString()
                        contract.save();
                    }
                })
                const [ workspace, workspacePath ] = OfficeData.createWorkspace(period.path, (err) => {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        fs.writeFileSync(workspacePath + "/output/contract.xml", contractBuffer);
                        this.generate(workspacePath).then((output) => {
                            output.workspace = workspace;
                            res.json(output);
                        })
                    }
                })
            })
            .error(error => {
                res.sendStatus(500);
            })
    }

    async generate(workspacePath: string): Promise<GeneratorResponse> {
        let response = {
            output: "",
            hasPdf: true,
            hasDocx: OfficeData.hasDocx(workspacePath),
            workspace: ""
        }
        
        await OfficeTools.saxon(
            workspacePath + "/output/contract.xml",
            OfficeData.getTemplateXsltPath(workspacePath, GenerationDocumentType.PDF, "merge.xslt"),
            workspacePath + "/output/merged.xml").then((o) => {
                response.output += o.stdout;
                response.output += o.stderr;
            });

        await OfficeTools.saxon(
            workspacePath + "/output/merged.xml",
            OfficeData.getTemplateXsltPath(workspacePath, GenerationDocumentType.PDF, "contract.xslt"),
            workspacePath + "/output/contract.html").then((o) => {
            response.output += o.stdout;
            response.output += o.stderr;
        });

        await OfficeTools.html2pdf(
            workspacePath + "/output/contract.html",
            workspacePath + "/output/contract.pdf").then((o) => {
            response.output += o.stdout;
            response.output += o.stderr;
        });

        if (response.hasDocx) {
            await OfficeTools.saxon(
                workspacePath + "/output/contract.xml",
                OfficeData.getTemplateXsltPath(workspacePath, GenerationDocumentType.DOCX, "merge.xslt"),
                workspacePath + "/output/merged_docx.xml").then((o) => {
                response.output += o.stdout;
                response.output += o.stderr;
            });

            await OfficeTools.saxon(
                workspacePath + "/output/merged_docx.xml",
                OfficeData.getTemplateXsltPath(workspacePath, GenerationDocumentType.DOCX, "contract_docx.xslt"),
                workspacePath + "/templates/docx/docx/word/document.xml").then((o) => {
                response.output += o.stdout;
                response.output += o.stderr;
            });

            let docxFile = fs.createWriteStream(workspacePath + "/output/contract.docx");
            let docxArchive = archiver("zip");
            docxArchive.pipe(docxFile);
            docxArchive.directory(workspacePath + "/templates/docx/docx/", false);
            await docxArchive.finalize();
        }

        response.output += "Finished successfully!"

        return response;
    }
}

export default GeneratorController