import React, {useEffect, ReactElement, useContext} from 'react';
import PeriodMessage from "../../shared/PeriodMessage"
import ContractService from "./services/ContractService";

import Contract from "./Contract";
import ContractMessage from "../../shared/ContractMessage";
import {Link} from "react-router-dom";
import {AuthContext} from "./AuthContext";

const Contractor: React.FC = () => {

    const [isPeriodsLoading, setIsPeriodsLoading] = React.useState<boolean>(false);
    const [periods, setPeriods] = React.useState<PeriodMessage[] | null>(null);
    const [selectedPeriod, setSelectedPeriod] = React.useState<number|undefined>(undefined);

    const [contracts, setContracts] = React.useState<ContractMessage[] | null>(null);
    const [isContractsLoading, setIsContractLoading] = React.useState<boolean>(false);
    const [selectedContract, setSelectedContract] = React.useState<number|undefined>(undefined);

    const auth = useContext(AuthContext)

    const updateContractsByPeriod = (period: number|undefined) => {
        if (period) {
            setIsContractLoading(true)
            setIsPeriodsLoading(true)
            ContractService.getLatestContractsByPeriod(period)
                .then(contracts => {
                    setContracts(contracts)
                    setSelectedContract((contracts && contracts.length > 0) ? contracts[0].user?.id : undefined)
                    setIsContractLoading(false)
                    setIsPeriodsLoading(false)
                })
        } else {
            setContracts([])
            setSelectedContract(undefined)
        }
    }

    useEffect(() => {
        if (!isPeriodsLoading && periods == null)
            ContractService.getPeriods()
                .then((periods) => {
                    setPeriods(periods)
                    setIsPeriodsLoading(false)
                    const p = (periods && periods.length > 0) ? periods[0].id : undefined
                    setSelectedPeriod(p)
                    updateContractsByPeriod(p);
                })
    }, [])


    const onSelectedPeriodChange = (event: { target: { value: any; }; }) => {
        setSelectedPeriod(event.target.value)
        updateContractsByPeriod(parseInt(event.target.value))
    }

    const onSelectedContractChange = (event: { target: { value: any; }; }) => {
        setSelectedContract(event.target.value)
    }

    const contractsSelect =
        (isContractsLoading)
            ? <div data-uk-spinner={true}></div>
            : (
                (contracts == undefined)
                ? null
                :
                    <select className="uk-select uk-margin-top uk-margin-bottom uk-margin-left uk-width-1-4" value={selectedContract} onChange={onSelectedContractChange}>
                        {contracts?.map(c => <option key={c?.user?.id} value={c?.user?.id}>{c?.user?.email}</option>)}
                    </select>

            )

    return (
        <div>
            <div className={"uk-flex"}>
                <select className="uk-select uk-margin-top uk-margin-bottom uk-margin-left uk-width-1-4" value={selectedPeriod} onChange={onSelectedPeriodChange}>
                    {periods?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {contractsSelect}
                {(auth.isAdmin) ? <Link className={"uk-margin-left uk-margin-top uk-margin-bottom uk-button uk-button-default"} to={"/"}>Back to Contractor</Link> : null}
            </div>

            <Contract period={selectedPeriod} userId={selectedContract}/>
        </div>
    )
}

export default Contractor