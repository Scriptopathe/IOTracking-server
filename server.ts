import * as express from "express"
import * as path from "path"
import * as exampleCtrl from "./controllers/example"
import * as middleware404 from "./middlewares/error-404"
import * as middlewareDB from './middlewares/database'
import * as bodyparser from "body-parser"
import * as rawrestapi from "./controllers/raw-rest-api"
import * as dbfiller from "./controllers/db-filler"
import * as serverstate from "./controllers/live-state"
import * as buoyControler from "./controllers/buoy-controler"

import { MQTTServer }   from "./mqtt/mqtt-server"

export class Server {
  public app: express.Application
  public mqttServer : MQTTServer

  constructor() {
    this.app = express();
    this.mqttServer = new MQTTServer()
  }

  /**
   * Route and middleware configuration is performed here.
   */
  public configure() : void {
      this.app.use(bodyparser.text())
      this.app.use(middlewareDB.dbMiddleware)
      this.app.use("/fill", dbfiller.router)
      this.app.use('/example', exampleCtrl.router)
      this.app.use('/api/state', serverstate.router)
      this.app.use("/api/buoys", buoyControler.router)
      this.app.use('/api', rawrestapi.router)
      this.app.use(middleware404.router)
  }


  public run() : void {
      this.configure()
      this.mqttServer.start()
      this.app.listen(3001)
  }
}



var server : Server = new Server()
server.run()