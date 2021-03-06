/** JSON Web Token secret key */
export var jwtSecret = "$secret$"

/** Set to true to bypass the authentication */
export var bypassAuth = false

/** Debug mode */
export var debug = false

/** Port on which the node server will listen */
export var listenPort = "$port$"

/** 
 * URL of the lora mqtt broken.
 * Example : mqtt://127.0.0.1 
 * */
export var loraMqttBrokerUrl = "$mqtt$"
export var loraServerUrl     = "$loraserver$"

/**
 * Topic to subscribe to.
 */
export var loraTopic = "application/#"

/**
 * APP EUI
 */
export var appEUI = "8932898392893829"