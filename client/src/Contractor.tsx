import React, {useEffect, ReactElement, useContext} from 'react';
import PeriodMessage from "../../shared/PeriodMessage"
import ContractService from "./services/ContractService";
import Contract from "./Contract";
import AuthService from "./services/AuthService";
import {Link} from "react-router-dom";
import {AuthContext} from "./AuthContext";

const Contractor: React.FC = () => {

    const [isPeriodsLoading, setIsPeriodsLoading] = React.useState<boolean>(false);
    const [periods, setPeriods] = React.useState<PeriodMessage[] | null>(null);
    const [selectedPeriod, setSelectedPeriod] = React.useState<number|undefined>(undefined);

    const auth = useContext(AuthContext)

    useEffect(() => {
        if (!isPeriodsLoading && periods == null)
            ContractService.getPeriods()
                .then((periods) => {
                    setPeriods(periods)
                    setIsPeriodsLoading(false)
                    const p = (periods && periods.length > 0) ? periods[0].id : undefined
                    setSelectedPeriod(p)
                })
    }, [])


    const onSelectedPeriodChange = (event: { target: { value: any; }; }) => {
        setSelectedPeriod(event.target.value)
    }

    return (
        <div>
            <div className={"uk-flex"}>
                <select className="uk-select uk-margin-top uk-margin-bottom uk-margin-left uk-width-1-4" value={selectedPeriod} onChange={onSelectedPeriodChange}>
                    {periods?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {(auth.isAdmin) ? <Link className={"uk-margin-left uk-margin-top uk-margin-bottom uk-button uk-button-default"} to={"/admin"}>Admin</Link> : null}
            </div>
            <Contract period={selectedPeriod} userId={auth.userId}/>
        </div>
    )
}

export default Contractor