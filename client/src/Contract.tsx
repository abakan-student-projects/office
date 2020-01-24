
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";

import React, {useEffect, ReactElement, useContext} from 'react';
import {Button, Dropdown, Flex} from "uikit-react"

import GeneratorResponse from "../../shared/GeneratorResponse"
import ContractService from "./services/ContractService";
import {AuthContext} from "./AuthContext";

type ContractProps = {
    period: number|undefined,
    userId: number|undefined
}

const Contract: React.FC<ContractProps> = (props) => {

    const [pdfUrl, setPdfUrl] = React.useState("");
    const [docxUrl, setDocxUrl] = React.useState("");
    const [contractXml, setContractXml] = React.useState("");
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [log, setLog] = React.useState<ReactElement[]>([]);
    const [editorHeight, setEditorHeight] = React.useState("500px");
    const auth = useContext(AuthContext)

    useEffect(() => {
        const updateEditorHeight = () => {
            let panel = document.getElementById("contract-panel");
            let height = (panel) ? panel.clientHeight : 500;
            height -= Math.max(0, document.body.clientHeight - window.innerHeight);
            setEditorHeight(height + "px" )
        }

        setTimeout(updateEditorHeight, 0)
        window.addEventListener('resize', updateEditorHeight)
        return () => {
            window.removeEventListener('resize', updateEditorHeight)
        }
    }, [])

    useEffect(() => {
        if (props.period && props.userId)
            ContractService.getContractByPeriod(props.userId, props.period)
                .then(c => { setContractXml(c.xml)})
                .catch(e => { setContractXml("")})
        setPdfUrl("")
        setDocxUrl("")
    }, [props.period, props.userId])

    const docxLink =
        (docxUrl)
            ? <li><a href={docxUrl} target="_blank">DOCX</a></li>
            : null
    const downloadButton =
        (pdfUrl)
            ?
            <div className="uk-margin-left">
                <Button>Download</Button>
                <Dropdown>
                    <ul className="uk-list uk-link-text">
                        <li><a href={pdfUrl} target="_blank">PDF</a></li>
                        {docxLink}
                    </ul>
                </Dropdown>
            </div>
            : null;

    const onGenerate = () => {
        if (undefined === props.period || contractXml === "") return;
        setIsGenerating(true);
        let formData = new FormData();
        formData.append("contract", new Buffer(contractXml).toString('base64'))
        fetch(process.env.REACT_APP_API_ENDPOINT + "/generate/" + props.period + "/" + props.userId,
            {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": "Token " + auth.token
                }
            })
            .then((response) => {
                return response.json() as Promise<GeneratorResponse>
            })
            .then((response) => {
                let lines = [
                    <div>Time: {Intl.DateTimeFormat("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }).format(Date.now())}</div>,
                    <div>Output:</div>, <div>{response.output}</div>
                ]
                setPdfUrl((response.output.indexOf("Error") < 0) ? process.env.REACT_APP_API_ENDPOINT + "/download/" + response.workspace + "/contract.pdf" : "")
                setDocxUrl((response.output.indexOf("Error") < 0 && response.hasDocx) ? process.env.REACT_APP_API_ENDPOINT + "/download/" + response.workspace + "/contract.docx" : "")
                setIsGenerating(false)
                setLog([...lines, ...log])
            })
            .catch((error) => {
                let time = Intl.DateTimeFormat("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }).format(Date.now());
                let lines = [
                    <div key={time + "-1"}>Time: {time}</div>,
                    <div key={time + "-2"}>Error: {error.toString()}</div>
                ]
                setIsGenerating(false)
                setLog([...lines, ...log])
            });
    }

    const generateButton =
        <Button
            onClick={onGenerate}>
            Save & Generate
        </Button>

    const generatedContent =
        (isGenerating)
            ? <div><div data-uk-spinner="ratio: 3"></div></div>
            :
                (pdfUrl)
                    ? <div className="uk-width-1-1 uk-height-1-1 uk-inline">
                        <iframe title="contract-pdf" src={pdfUrl} className="uk-width-1-1 uk-height-1-1"/>
                        <div className="uk-position-top-right">
                            <Flex className="uk-margin-small-top uk-margin-right">
                                {generateButton}
                                {downloadButton}
                            </Flex>
                        </div>
                      </div>
                    : <div>{generateButton}</div>

    return (
        <div>
            <div id="contract-panel" data-uk-grid={true} data-height-match={true} data-uk-height-viewport="expand: true" className="uk-grid-small uk-margin-left">
                <AceEditor
                    mode="xml"
                    theme="github"
                    name="contract-xml-editor"
                    width="" height={editorHeight}
                    onChange={setContractXml}
                    value={contractXml}
                    className="uk-width-1-2 uk-margin-right"
                    placeholder="Put your XML here"
                />
                <div data-uk-height-viewport="expand: true" className="uk-inline uk-width-expand uk-margin-right uk-flex uk-flex-middle uk-flex-center">
                    {generatedContent}
                </div>
            </div>
            <div className="uk-panel-scrollable uk-height-small uk-text-small"><pre className="log-item">{log}</pre></div>
        </div>
    )
}

export default Contract