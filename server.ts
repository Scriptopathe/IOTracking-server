import * as express from "express"
import * as path from "path"
import * as exampleCtrl from "./controllers/example"
import * as raceCtrl from "./controllers/race"
import * as userCtrl from "./controllers/user"
import * as deviceCtrl from "./controllers/device"
import * as middleware404 from "./middlewares/error-404"
import * as middlewareDB from './middlewares/database'
import * as bodyparser from "body-parser"

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
  }

  /**
   * Route and middleware configuration is performed here.
   */
  public configure() : void {
      this.app.use(bodyparser.text())
      this.app.use(middlewareDB.dbMiddleware)
      this.app.use('/example', exampleCtrl.router)
      this.app.use('/races', raceCtrl.router)
      this.app.use('/user', userCtrl.router)
      this.app.use('/device', deviceCtrl.router)
      this.app.use(middleware404.router)
  }


  public run() : void {
      this.configure()
      this.app.listen(3001)
  }
}

var server : Server = new Server()
server.run()