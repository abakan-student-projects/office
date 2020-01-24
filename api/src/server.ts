import App from './app'

import * as bodyParser from 'body-parser'
import loggerMiddleware from './middleware/logger'
import * as cors from "cors"
import * as session from "express-session";

import GeneratorController from "./controllers/generator.controller";
import DownloadController from "./controllers/download.controller";
import PeriodsController from "./controllers/periods.controller";
import AuthController from "./controllers/auth.controller";
import ContractsController from "./controllers/contracts.controller";
const models = require("./db")

const app = new App({
    port: parseInt(process.env.PORT),
    controllers: [
        new GeneratorController(),
        new DownloadController(),
        new PeriodsController(),
        new AuthController(),
        new ContractsController()
    ],
    middleWares: [
        loggerMiddleware,
        cors(),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        session({ secret: "office", cookie: {maxAge: 60000}, resave: false, saveUninitialized: false})
    ]
})

app.listen()