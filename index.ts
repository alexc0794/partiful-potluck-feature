import serverless from "serverless-http";
import https from "https";
import fs from "fs";
import express from "express";
import { IS_DEV, EXPRESS_PORT } from "./config";

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

require("./src/routes").default(app);

if (IS_DEV) {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(EXPRESS_PORT, () => {
      console.log(`Started express server at port ${EXPRESS_PORT}`);
    });
}

module.exports.expressHandler = serverless(app);
