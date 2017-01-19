export interface MessageContent {
  x : number            // range 0-1024
  y : number            // range 0-1024
  batteryLevel : number // range 0-100
  time? : string
}

export interface ApplicationMessage {
  time : string
  devEUI : string
  content : MessageContent
}