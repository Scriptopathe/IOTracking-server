import * as passport                    from 'passport'
import * as monk                        from "monk"
import * as express                     from "express"
import * as jwt                         from "jsonwebtoken"
import * as config                      from "../config"

import { ExtractJwt, Strategy }         from 'passport-jwt'
import { db }                           from '../middlewares/database'
import { User, UserModel }              from '../models/user'

var router = express.Router()

router.get('/profile', 
    passport.authorize('jwt', { session: false }),
    function(req, res) {
        res.send("Hello " + req.user.username);
    }
);

router.post("/login", function(req, res) {
    let body : any;
    try {
        body = JSON.parse(req.body)
    } catch(e) {
        res.status(400).end(e)
        return
    }

    if(body.username && body.password){
        var name = body.username
        var password = body.password
    } else {
        res.status(401)
        res.write("No name and password supplied")
        res.end()
        return
    }

    // usually this would be a database call:
    User.findOne(db, { username: name }, (user => {
        if(!user) {
            res.status(401).end("no such user found");
        }

        if(user.password === body.password) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = { id: user.identifier }
            var token = jwt.sign(payload, config.jwtSecret)
            res.status(200).json({
                token: token,
                username: user.username,
                role: user.role
            })
        } else {
            res.status(401).end("passwords did not match");
        }
    }))
});

export { router }