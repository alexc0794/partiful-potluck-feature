import { Potluck, PotluckItem, PotluckItemClaimant } from "../interfaces";
import BaseRepository from "./base";


export default class QuickPotluckRepository extends BaseRepository {
  tableName = "QuickPotlucks";

  _buildPotluckPK(partyId: string): string {
    return `PARTY#${partyId}`;
  }

  _buildPotluckSK(partyId: string): string {
    return `METADATA#${partyId}`;
  }

  _buildItemSK(itemName: string): string {
    return `PLI#${itemName}`;
  }

  _buildClaimantSK(phoneNumber: string, itemName: string): string {
    return `PLIC#${phoneNumber}$PLI#${itemName}`
  }

  async getPotluck(partyId: string): Promise<Potluck | null> {
    return new Promise((resolve) =>
      this.ddbClient.get(
        {
          TableName: this.tableName,
          Key: { 'PK': this._buildPotluckPK(partyId), 'SK': this._buildPotluckSK(partyId) },
        },
        (err, data) => {
          if (err) {
            console.error("Could not find potluck", partyId, err);
            return resolve(null);
          }
          return resolve(data.Item);
        }
      )
    );
  }

  async getPotluckWithItems(partyId: string): Promise<Potluck | null> {
    return new Promise((resolve) =>
      this.ddbClient.query(
        {
          TableName: this.tableName,
          KeyConditionExpression: "PK = :pk AND SK BETWEEN :metadata AND :items",
          ExpressionAttributeValues: {
            ":pk": this._buildPotluckPK(partyId),
            ":metadata": this._buildPotluckSK(partyId),
            ":items": 'PLIC$', // $ is right after # in ASCII, so $ is the be upper bound to get all items for the potluck
          },
          ScanIndexForward: true
        },
        (err, data) => {
          if (err || data.Items.length === 0) {
            console.error(
              "Could not find quick potluck with items",
              partyId,
              err
            );
            return resolve(null);
          }
          const potluckItems: PotluckItem[] = [];
          const claimants: {[itemName: string]: {[phoneNumber: string]: PotluckItemClaimant}} = {};
          const [item, ...restItems] = data.Items;
          const potluck: Potluck = item;
          restItems.forEach(restItem => {
            if ('claimedAtMs' in restItem && 'itemName' in restItem) {
              const claimant: PotluckItemClaimant = restItem;
              if (claimant.itemName in claimants) {
                claimants[claimant.itemName][claimant.phoneNumber] = claimant;
              } else {
                claimants[claimant.itemName] = {
                  [restItem.phoneNumber]: claimant
                };
              }
            } else {
              potluckItems.push(restItem);
            }
          });
          potluckItems.forEach(potluckItem => {
            potluckItem.claimants = claimants[potluckItem.itemName] || {};
          });

          potluck.potluckItems = potluckItems;
          return resolve(potluck);
        }
      )
    );
  }

  async createPotluck(potluck: Potluck): Promise<Potluck> {
    return new Promise((resolve, reject) =>
      this.ddbClient.put(
        {
          TableName: this.tableName,
          Item: {
            PK: this._buildPotluckPK(potluck.partyId),
            SK: this._buildPotluckSK(potluck.partyId),
            ...potluck,
          },
        },
        (err, data) => {
          if (err) {
            console.error("Failed to create potluck", potluck.partyId, err);
            return reject();
          }
          return resolve(data);
        }
      )
    );
  }

  async requestPotluckItem(partyId: string, potluckItem: PotluckItem): Promise<PotluckItem> {
    return new Promise((resolve, reject) => 
      this.ddbClient.put(
        {
          TableName: this.tableName,
          // TODO: Write a query that conditionally adds the potluck item if it does not already exist in the potluck
          ConditionExpression: 'attribute_not_exists(SK)',
          Item: {
            PK: this._buildPotluckPK(partyId),
            SK: this._buildItemSK(potluckItem.itemName),
            ...potluckItem,
          },
        },
        (err) => {
          if (err) {
            console.error("Could not request potluck items", partyId, potluckItem, err);
            return reject();
          }
          return resolve(potluckItem);
        }
      )
    );
  }

  async claimPotluckItem(partyId: string, itemName: string, claimant: PotluckItemClaimant): Promise<boolean> {
    /**
     * 1. Check item metadata if newly claimed + previously claimed quantity exceeds requested quantity
     * 2. Update(?) / Put claimed item so that user adds quantity to the claim if it already exists
     * 3. Update item metadata to reflect newly claimed quantity
     */
    return new Promise((resolve, reject) => 
      this.ddbClient.transactWrite(
        {
          TransactItems: [
            {
              Update: {
                TableName: this.tableName,
                Key: { 'PK': this._buildPotluckPK(partyId), 'SK': this._buildItemSK(itemName) },
                UpdateExpression: 'SET quantityClaimed = quantityClaimed + :quantity',
                ExpressionAttributeValues: {
                  ':quantity': claimant.quantityClaimed,
                },
              }
            },
            {
              Put: {
                TableName: this.tableName,
                Item: {
                  PK: this._buildPotluckPK(partyId),
                  SK: this._buildClaimantSK(claimant.phoneNumber, itemName),
                  ...claimant,
                },
              }
            },
          ],
        },
        (err) => {
          if (err) {
            console.error("Failed to claim potluck item", partyId, itemName, claimant, err);
            return reject(false);
          }
          return resolve(true);
        }
      )
    );
  }

  async scan(): Promise<void> {
    return new Promise((resolve) => 
      this.ddbClient.scan(
        {
          TableName: this.tableName,
        },
        (err, data) => {
          console.log(err, data);
          return resolve();
        }
      )
    )
  }
}