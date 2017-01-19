/** JSON Web Token secret key */
export var jwtSecret = "0cd8b138-dd7a-11e6-9a25-3065ec8e1014"

/** Set to true to bypass the authentication */
export var bypassAuth = false

/** Debug mode */
export var debug = false

/** Port on which the node server will listen */
export var listenPort = "3001"

/** 
 * URL of the lora mqtt broken.
 * Example : mqtt://127.0.0.1 
 * */
export var loraTopic = "gateway/#"
export var loraMqttBrokerUrl = "mqtt:192.168.43.231"
// export var loraMqttBrokerUrl = "mqtt://127.0.0.1" //mqtt:192.168.43.231"