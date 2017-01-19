import { MessageContent, ApplicationMessage }       from "./mqtt-server-types"

export interface ParsingStrategy {
    parse(message : string) : ApplicationMessage;
}