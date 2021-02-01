"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const client_1 = require("./client/client");
new client_1.Bot().start(config_1.config);
