import * as express                             from "express"
import * as path                                from "path"
import * as exampleCtrl                         from "./controllers/example"
import * as middleware404                       from "./middlewares/error-404"
import * as middlewareDB                        from './middlewares/database'
import * as bodyparser                          from "body-parser"
import * as rawrestapi                          from "./controllers/raw-rest-api"
import * as dbfiller                            from "./controllers/db-filler"
import * as serverstate                         from "./controllers/live-state"
import * as buoyControler                       from "./controllers/buoy-controler"
import * as uploadControler                     from "./controllers/upload-controler"
import * as csvControler                        from "./controllers/csv-import-controler"
import * as appEUIControler                     from "./controllers/appEUI-controler"
import * as monk                                from "monk"
import * as jwt                                 from "jsonwebtoken"
import * as passport                            from "passport"
import * as config                              from './config'
import * as authcontroler                       from './controllers/auth-controler'
import { ExtractJwt, Strategy }                 from 'passport-jwt'
import { db }                                   from './middlewares/database'
import { User, UserModel }                      from './models/user'
import { MQTTServer }                           from "./mqtt/mqtt-server"
require('ts-node/register')


export class Server {
    public app: express.Application
    public mqttServer : MQTTServer

    constructor() {
        this.app = express();
        this.mqttServer = new MQTTServer()
    }

    /**
     * Sets up authentication middleware.
     */
    setupAuth() {
        var opts : any = {}
        opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
        opts.secretOrKey = config.jwtSecret
        opts.passReqToCallback = true

        passport.use(new Strategy(opts, 
        function(req : express.Request, jwt_payload : any, done : any) {
            User.findOne(db, { _id: jwt_payload.id }, function(user) {
                if (user) {
                    req.user = user
                    done(null, user);
                } else {
                    done(null, false);        
                }
            });
        }));
    }

    /**
     * Configures the CORS access control policy.
     */
    setupAccessControl() {
        this.app.use(function(req, res, next) {
          res.setHeader("Access-Control-Allow-Origin", "*")
          res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST")
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
          res.setHeader("Access-Control-Expose-Headers", "X-IOTracking-Count")
          next()
        })
    }
    /**
     * Route and middleware configuration is performed here.
     */
    public configure() : void {
        this.setupAuth()
        this.setupAccessControl()

        this.app.use(bodyparser.text())
        this.app.use(middlewareDB.dbMiddleware)
        this.app.use('/auth', authcontroler.router)
        this.app.use('/public', express.static('public'))
        this.app.use("/fill", dbfiller.router)
        this.app.use("/api/upload/racemaps", uploadControler.router)
        this.app.use('/example', exampleCtrl.router)
        this.app.use('/api/state', serverstate.router)
        this.app.use("/api/buoys", buoyControler.router)
        this.app.use('/api', rawrestapi.router)
        this.app.use("/api/import-csv", csvControler.router)
        this.app.use('/api/appEUI', appEUIControler.router)
        this.app.use('/api', middleware404.router)

        // HTTP server
        this.app.use('', express.static('site/IoTracking-Client/dist', {
            index: 'index.html'
        }))

        // Catch all other routes and return the index file
        this.app.get('*', (req, res) => {
            res.sendFile(__dirname + '/site/IoTracking-Client/dist/index.html');
        });
    }


    public run() : void {
        this.configure()
        this.mqttServer.start()
        this.app.listen(config.listenPort)
        console.log("Listening on port :" + config.listenPort)
    }
}



var server : Server = new Server()
server.run()