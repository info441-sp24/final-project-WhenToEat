import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import enableWs from 'express-ws';

// import WebAppAuthProvider from 'msal-node-wrapper'

// const authConfig = {
//     auth: {
//    	    clientId: "",
//     	authority: "",
//     	clientSecret: "",
//     	redirectUri: "/redirect"
//     },
//     redirect: "",
// 	system: {
//     	loggerOptions: {
//         	loggerCallback(loglevel, message, containsPii) {
//             	console.log(message);
//         	},
//         	piiLoggingEnabled: false,
//         	logLevel: 3,
//     	}
// 	}
// };  

import apiRouter from "./routes/api.js";
import models from './models.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();
enableWs(app);

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// const oneDay = 1000 * 60 * 60 * 24
// app.use(sessions({
//     secret: "this is some secret key I am making up p8kn fwlihftrn3oinyswnwd3in4oin",
//     saveUninitialized: true,
//     cookie: {maxAge: oneDay},
//     resave: false
// }))

// const authProvider = await WebAppAuthProvider.WebAppAuthProvider.initialize(authConfig);
// app.use(authProvider.authenticate());

app.use((req, res, next) => {
    req.models = models
    next()
})

app.use('/api', apiRouter);

app.listen(8080, () => {
    console.log('server listening on port 8080')
})

// app.get('/signin', (req, res, next) => {
//     return req.authContext.login({
//         postLoginRedirectUri: "/", // redirect here after login
//     })(req, res, next);

// });
// app.get('/signout', (req, res, next) => {
//     return req.authContext.logout({
//         postLogoutRedirectUri: "/", // redirect here after logout
//     })(req, res, next);

// });
// app.use(authProvider.interactionErrorHandler());

let socketCounter = 1
let allSockets = {}

app.ws("/wheelSocket", (ws, res) => {
    let mySocketNum = socketCounter
    socketCounter++
    console.log("user " + mySocketNum + " connected via websocket")

    allSockets[mySocketNum] = {
        socket: ws,
        name: mySocketNum
    }

    ws.on('message', msg => {
        try {
            const socketMsg = JSON.parse(msg)
            if (socketMsg.action == "updateName") {
                console.log("user " + allSockets[mySocketNum].name + " is trying to update name to " + socketMsg.name)
                allSockets[mySocketNum].name = socketMsg.name
                showLobby()
            }
        } catch (error) {
            console.error("Websocket message received error: " + error)
        }
        
    })

    ws.on('close', () => {
        console.log(`user ${mySocketNum} disconnected`)
        delete allSockets[mySocketNum];
        showLobby();
    })
})

function showLobby() {
    const lobbyNames = Object.values(allSockets).map(socketInfo => socketInfo.name);
    console.log(lobbyNames)
    // Object.values(lobbyNames).forEach(socketInfo => {
    //     socketInfo.socket.send(socketInfo.name);
    // });
}

export default app;
