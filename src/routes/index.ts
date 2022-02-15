import express, { Router } from "express";
import party from "./party";
import potluck from "./potluck";


const router = Router();

export default (app: express.Application) => {
  party(router);
  potluck(router);

  app.use("/", router);
};
