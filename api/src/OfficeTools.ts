import { exec } from "child_process";
import ProcessOutput from "./ProcessOutput";

class OfficeTools {
    static ToolsPath = process.env.OFFICE_TOOLS_PATH;

    public static async saxon(xmlFilePath: string, xsltFilePath: string, outputFilePath: string): Promise<ProcessOutput> {
        return new Promise<ProcessOutput>(resolve => {
            exec(
                "java -jar " + this.ToolsPath + "/saxon9he.jar -s:" + xmlFilePath + " -xsl:" + xsltFilePath + " -o:" + outputFilePath,
                (error, stdout, stderr) => {
                    if (error) {
                        console.log(error);
                        console.log(stdout);
                        console.log(stderr);
                    }
                    resolve({ error: error, stdout: stdout, stderr: stderr });
                })
        })
    }

    public static async html2pdf(htmlPath: string, pdfPath: string): Promise<ProcessOutput> {
        return new Promise<ProcessOutput>(resolve => {
            exec(
                "wkhtmltopdf --log-level warn -T 15mm -L 20mm -B 15mm -R 15mm " + htmlPath + " " + pdfPath,
                (error, stdout, stderr) => {
                    if (error) {
                        console.log(error);
                        console.log(stderr);
                    }
                    console.log(stdout);
                    resolve({ error: error, stdout: stdout, stderr: stderr});
                })
        })
    }
}

export default OfficeTools