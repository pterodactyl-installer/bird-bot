import fs from "fs";
import reader from "readline-sync";
import { config } from "./config/config";

let baseConfig = fs.readFileSync(`${__dirname}/config/config.js`, "utf8");
let baseSrcConfig = fs.readFileSync(
  `${__dirname}/../src/config/config.ts`,
  "utf8"
);

if (config.token === "TOKEN") {
  console.log("Enter your discord API token: ");
  const TOKEN = reader.question();
  baseConfig = baseConfig.replace('"TOKEN"', `"${TOKEN}"`);
  baseSrcConfig = baseSrcConfig.replace('"TOKEN"', `"${TOKEN}"`);
}

if (config.expressPort === "PORT") {
  console.log(
    "Enter your express API PORT (the api will run on this port) (5000): "
  );
  const PORT = reader.question("", { defaultInput: "5000" });
  baseConfig = baseConfig.replace('"PORT"', `"${PORT}"`);
  baseSrcConfig = baseSrcConfig.replace('"PORT"', `"${PORT}"`);
}

if (config.expressFQDN === "FQDN") {
  console.log(
    "Enter your express API FQDN (https://api.hello.com or http://456.846.126.753:8456): "
  );
  const FQDN = reader.question();
  baseConfig = baseConfig.replace('"FQDN"', `"${FQDN}"`);
  baseSrcConfig = baseSrcConfig.replace('"FQDN"', `"${FQDN}"`);
}

if (config.binFQDN === "binFQDN") {
  console.log("An FQDN to netcat based pastebin server instance: ");
  const binFQDN = reader.question();
  baseConfig = baseConfig.replace('"binFQDN"', `"${binFQDN}"`);
  baseSrcConfig = baseSrcConfig.replace('"binFQDN"', `"${binFQDN}"`);
}

if (config.binPORT === "binPORT") {
  console.log(
    "The port on which that the pastebin nc server is hosted (9999): "
  );
  const binPORT = reader.question("", { defaultInput: "9999" });
  baseConfig = baseConfig.replace('"binPORT"', `"${binPORT}"`);
  baseSrcConfig = baseSrcConfig.replace('"binPORT"', `"${binPORT}"`);
}

fs.writeFileSync(`${__dirname}/config/config.js`, baseConfig);
fs.writeFileSync(`${__dirname}/../src/config/config.ts`, baseSrcConfig);
