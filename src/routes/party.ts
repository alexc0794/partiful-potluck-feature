import { Router, Request, Response } from "express";
import bodyParser from "body-parser";
import QuickPartiesRepository from "../repositories/quickparties";
import { Party } from "../interfaces";



export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/party/:partyId", async function (
    req: Request,
    res: Response
  ) {
    const { partyId } = req.params;

    let party: Party | null = await new QuickPartiesRepository().getPartyWithGuests(partyId);
    if (!party) {
      return res.status(403).send("Invalid party");
    }

    return res.status(200).send(party);
  });

};
