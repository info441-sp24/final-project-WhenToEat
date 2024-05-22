import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import enableWs from 'express-ws';
import sessions from 'express-session';
import WebAppAuthProvider from 'msal-node-wrapper'
// import httpProxyMiddleware from 'http-proxy-middleware'

const authConfig = {
    auth: {
   	    clientId: "9d847080-a50c-4380-b3ca-51246ba36d9c",
    	authority: "https://login.microsoftonline.com/f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
    	clientSecret: "Yiq8Q~Tnr9nKPwFmapOdiOlhlTV1-Dfb8C2zacBj",
    	redirectUri: "/redirect"
    },
	system: {
    	loggerOptions: {
        	loggerCallback(loglevel, message, containsPii) {
            	console.log(message);
        	},
        	piiLoggingEnabled: false,
        	logLevel: 3,
    	}
	}
};  

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

app.use(express.static(path.join(__dirname, 'public/build')));

app.use(sessions({
    secret: "this is some secret key I am making up p8kn fwlihftrn3oinyswnwd3in4oin",
    saveUninitialized: true,
    resave: false
}))

const authProvider = await WebAppAuthProvider.WebAppAuthProvider.initialize(authConfig);
app.use(authProvider.authenticate());

app.use((req, res, next) => {
    req.models = models
    next()
})

app.listen(8080, () => {
    console.log('server listening on port 8080')
})

// app.use('/*', createProxyMiddleware({target: 'http://localhost:4000'}))

app.get('/signin', (req, res, next) => {
    return req.authContext.login({
        postLoginRedirectUri: "/", // redirect here after login
    })(req, res, next);

});
app.get('/signout', (req, res, next) => {
    return req.authContext.logout({
        postLogoutRedirectUri: "/", // redirect here after logout
    })(req, res, next);

});

app.use('/api', apiRouter);
app.use(authProvider.interactionErrorHandler());

export default app;
