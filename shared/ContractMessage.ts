import UserMessage from "./UserMessage";

export default interface ContractMessage {
    xml: string,
    user?: UserMessage
}