import uuid = require("uuid/v1")
import fs = require("fs")
import ncp = require("ncp")
import GenerationDocumentType from "./GenerationDocumentType";
import * as path from "path";

class OfficeData {
    static DataPath = process.env.OFFICE_DATA_PATH;

    public static createWorkspace(period: string, callback: (err: Error[] | null) => void): [ string, string] {
        const workspace = uuid();
        const workspacePath = this.getWorkspacePath(workspace);
        fs.mkdirSync(workspacePath);
        fs.mkdirSync(workspacePath + "/output");
        ncp(
            OfficeData.DataPath + "/periods/" + period,
            workspacePath,
            (err) => {
                if (err) {
                    console.log(err);
                }
                callback(err);
            });

        return [ workspace, workspacePath ];
    }

    public static getWorkspacePath(workspace: string): string {
        return OfficeData.DataPath + "/workspaces/" + workspace
    }

    public static getTemplateXsltPath(workspacePath: string, documentType: GenerationDocumentType, templateName: string): string {
        return workspacePath + this.getRelativeTemplatesPath(documentType) + "/" + templateName;
    }

    public static getTemplateXslt(workspacePath: string, documentType: GenerationDocumentType, templateName: string): string {
        return fs.readFileSync(this.getTemplateXsltPath(workspacePath, documentType, templateName), "utf8").toString();
    }

    static getRelativeTemplatesPath(documentType: GenerationDocumentType): string {
        if (documentType == GenerationDocumentType.PDF) {
            return "/templates/pdf";
        } else if (documentType == GenerationDocumentType.DOCX) {
            return "/templates/docx";
        } else {
            return "/templates";
        }
    }

    public static hasDocx(workspacePath: string): boolean {
        return fs.existsSync(path.join(workspacePath,"templates", "docx"));
    }

    public static getPeriods(): string[] {
        return fs.readdirSync(OfficeData.DataPath + "/periods/")
    }
}

export default OfficeData