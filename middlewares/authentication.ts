import * as passport                    from 'passport'
import * as monk                        from "monk"
import * as express                     from "express"
import * as jwt                         from "jsonwebtoken"
import * as config                      from "../config"
import { ExtractJwt, Strategy }         from 'passport-jwt'
import { db }                           from './database'
import { User, UserModel }              from '../models/user'

function authenticate() {
    if(config.noLogin) { return [] }

    return [
        passport.authorize('jwt', { session: false })
    ]
}

function authenticateRole(roles : string[]) {
    if(config.noLogin) { return [] }
    
    return [
        passport.authorize('jwt', { session: false }),
        function(req : express.Request, res : express.Response, next : express.NextFunction) {          
            if(roles.indexOf(req.user.role) < 0) {
                res.status(401).end("Unauthorized role : " + req.user.role)
            } else {
                next()
            }
        }
    ]
}

export { authenticate, authenticateRole }