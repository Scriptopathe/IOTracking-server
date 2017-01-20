import { MessageContent, ApplicationMessage }       from "./mqtt-server-types"
import { ParsingStrategy }                          from "./parsing-strategy"

interface LoraRXMessage {
  // id of the device
  devEUI : string
  
  // rssi
  rssi : number

  // time
  time : string
  
  // base64 encoded data
  data : string
}

export class ApplicationParsingStrategy implements ParsingStrategy {

  decodeb64(msg : string) : MessageContent {
    let decoded = new Buffer(msg, "base64")
    var number = 0
    var byteNumbers = new Array(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
      byteNumbers[i] = decoded.readUInt8(i)
      console.log("byte[" + i + "] = " + byteNumbers[i])
      number |= byteNumbers[i] << (8 * i)
    }

    let newX = number & 0x03FF
    let newY = (number >> 10) & 0x03FF
    let newBat = (number >> 20) & 0xF
    
    return {
      x: newX,
      y: newY,
      batteryLevel: newBat
    }
  }

  decode(msg : string) : MessageContent {
    return this.decodeb64(msg)
  }

  extractLoraMessage(message : string) : LoraRXMessage {
      var loraMessage : LoraRXMessage
      try {
         loraMessage = JSON.parse(message)
         return loraMessage.data && loraMessage.devEUI && loraMessage.time && loraMessage
      } catch(e) {
        console.error("Message : " + message)
        console.error("Bad message format. " + e)
        return null
      }
  }

  extractMessage(message : LoraRXMessage) : MessageContent {
      if(message == null) return null
      let payload = message.data
      let messageContent : MessageContent 

      try {
        return this.decode(payload)
      } catch(e) {
        console.error("Bad data format (" + e + ") : " + payload)
        return null
      }
  }

  public parse(message : string) : ApplicationMessage {
      var loraMessage : LoraRXMessage = this.extractLoraMessage(message)
      var messageContent : MessageContent = this.extractMessage(loraMessage)
      if(!messageContent) return
      
      // sometimes the rx time is not valid.
      let invalidTime = new Date(loraMessage.time).getFullYear() < 2000

      var applicationMessage : ApplicationMessage = {
        content: messageContent,
        time   : invalidTime ? new Date().toString() : loraMessage.time,
        devEUI : loraMessage.devEUI
      }

      return applicationMessage
  }
}