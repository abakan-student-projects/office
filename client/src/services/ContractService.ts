import ContractMessage from "../../../shared/ContractMessage"
import AuthService from "./AuthService";
import PeriodMessage from "../../../shared/PeriodMessage"

class ContractService {
    static getContractByPeriod(userId: number, period: number): Promise<ContractMessage> {
        return fetch(process.env.REACT_APP_API_ENDPOINT + "/contracts/byPeriod/" + period + "/" + userId,
            {
                method: "GET",
                headers: {
                    "Authorization": "Token " + AuthService.token
                },
            })
            .then(response => response.json() as Promise<ContractMessage>)
    }

    static getLatestContractsByPeriod(period: number): Promise<ContractMessage[]> {
        return fetch(process.env.REACT_APP_API_ENDPOINT + "/contracts/byPeriodWithUsers/" + period,
            {
                method: "GET",
                headers: {
                    "Authorization": "Token " + AuthService.token
                }
            })
            .then(response => response.json() as Promise<ContractMessage[]>)
    }

    static getPeriods(): Promise<PeriodMessage[]> {
        return fetch(process.env.REACT_APP_API_ENDPOINT + "/periods",
            {
                method: "GET",
                headers: {
                    "Authorization": "Token " + AuthService.token
                }
            })
            .then(response => response.json() as Promise<PeriodMessage[]>)
    }

}

export default ContractService