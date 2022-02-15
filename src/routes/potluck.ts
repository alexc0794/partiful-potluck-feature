import { Router, Request, Response } from "express";
import bodyParser from "body-parser";
import { Potluck } from "../interfaces";
import QuickPotluckRepository from "../repositories/quickpotluck";



export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/potluck/:partyId", async function (
    req: Request,
    res: Response
  ) {
    const { partyId } = req.params;

    let potluck: Potluck | null = await new QuickPotluckRepository().getPotluckWithItems(partyId);
    if (!potluck) {
      return res.status(403).send("Invalid potluck");
    }

    return res.status(200).send(potluck);
  });

};
