import * as express from "express"
import * as path from "path"
import * as exampleCtrl from "./controllers/example"
import * as middleware404 from "./middlewares/error-404"
import * as middlewareDB from './middlewares/database'

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
  }

  /**
   * Route and middleware configuration is performed here.
   */
  public configure() : void {
      this.app.use(middlewareDB.dbMiddleware)
      this.app.use('/example', exampleCtrl.router)
      this.app.use(middleware404.router)
  }


  public run() : void {
      this.configure()
      this.app.listen(3001)
  }
}

var server : Server = new Server()
server.run()