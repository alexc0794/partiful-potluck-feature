import BaseRepository from "./base";
import { Party, Guest } from "../interfaces";


export default class QuickPartiesRepository extends BaseRepository {
  tableName = "QuickParties";

  _buildPartyPK(partyId: string): string {
    return `PARTY#${partyId}`
  }

  _buildPartySK(partyId: string): string {
    return `METADATA#${partyId}`
  }

  _buildGuestSK(phoneNumber: string): string {
    return `PARTYGUEST#${phoneNumber}`
  }

  async getParty(partyId: string): Promise<Party | null> {
    return new Promise((resolve) =>
      this.ddbClient.get(
        {
          TableName: this.tableName,
          Key: { 'PK': this._buildPartyPK(partyId), 'SK': this._buildPartySK(partyId) },
        },
        (err, data) => {
          if (err) {
            console.error("Could not find party", partyId, err);
            return resolve(null);
          }
          return resolve(data.Item);
        }
      )
    );
  }

  async getPartyWithGuests(partyId: string): Promise<Party | null> {
    return new Promise((resolve) =>
      this.ddbClient.query(
        {
          TableName: this.tableName,
          KeyConditionExpression: "PK = :pk AND SK BETWEEN :metadata AND :guests",
          ExpressionAttributeValues: {
            ":pk": this._buildPartyPK(partyId),
            ":metadata": this._buildPartySK(partyId),
            ":guests": 'PARTYGUEST$', // $ is right after # in ASCII, so $ is the be upper bound to get all guests for the party
          },
          ScanIndexForward: true
        },
        (err, data) => {
          if (err || data.Items.length === 0) {
            console.error(
              "Could not find quick Party",
              partyId,
              err
            );
            return resolve(null);
          }
          const [item, ...restItems] = data.Items;
          const party: Party = item;
          party.guests = restItems;
          return resolve(party);
        }
      )
    );
  }

  async createParty(party: Party): Promise<Party> {
    return new Promise((resolve, reject) =>
      this.ddbClient.put(
        {
          TableName: this.tableName,
          Item: {
            PK: this._buildPartyPK(party.partyId),
            SK: this._buildPartySK(party.partyId),
            ...party,
          },
        },
        (err, data) => {
          if (err) {
            console.error("Failed to create Party", party.partyId, err);
            return reject();
          }
          return resolve(data);
        }
      )
    );
  }
  
  async updatePartyAttribute(partyId: string, attribute: string, value: any): Promise<any> {
    /**
     * Used to update single attributes of the Party (i.e. schedule Party, end Party)
     */
    const expressionAttributeValues = {};
    expressionAttributeValues[`:${attribute}`] = value;

    return new Promise((resolve, reject) =>
      this.ddbClient.update(
        {
          TableName: this.tableName,
          Key: { 'PK': this._buildPartyPK(partyId), 'SK': this._buildPartySK(partyId) },
          UpdateExpression: `set ${attribute} = :${attribute}`,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "UPDATED_NEW"
        },
        (err, data) => {
          if (err) {
            console.error("Failed to update party attribute", partyId, attribute, value, err);
            return reject();
          }
          return resolve(data.Attributes);
        }
      )
    );
  }

  async createGuest(partyId: string, guest: Guest): Promise<any> {
    return new Promise((resolve, reject) =>
      this.ddbClient.put(
        {
          TableName: this.tableName,
          Item: {
            PK: this._buildPartyPK(partyId),
            SK: this._buildGuestSK(guest.phoneNumber),
            ...guest,
          },
        },
        (err, data) => {
          if (err) {
            console.error("Failed to create party guest", guest, err);
            return reject();
          }
          return resolve(data);
        }
      )
    );
  }

  async getGuests(phoneNumber: string): Promise<Guest[]> {
    /**
     * Used to get all Partys for a guest
     */
    return new Promise((resolve) => 
      this.ddbClient.query(
        {
          TableName: this.tableName,
          IndexName: 'GuestIndex',
          KeyConditionExpression: "SK = :sk",
          ExpressionAttributeValues: {
            ":sk": this._buildGuestSK(phoneNumber)
          },
          ScanIndexForward: true
        },
        (err, data) => {
          if (err) {
            console.error(
              "Could not find guest's partys",
              phoneNumber,
              err
            );
            return resolve([]);
          }
          return resolve(data.Items);
        }
      )
    )
  }

  async getGuest(partyId: string, phoneNumber: string): Promise<Guest | null> {
    /**
     * Used to check if guest is in a Party
     */
    return new Promise((resolve) => 
      this.ddbClient.query(
        {
          TableName: this.tableName,
          IndexName: 'GuestIndex',
          KeyConditionExpression: "SK = :sk AND PK = :pk",
          ExpressionAttributeValues: {
            ":sk": this._buildGuestSK(phoneNumber),
            ":pk": this._buildPartyPK(partyId),
          },
        },
        (err, data) => {
          if (err || (data.Items && data.Items.length === 0)) {
            console.error("Could not find party guest", partyId, phoneNumber, err);
            return resolve(null);
          }
          return resolve(data.Items[0]);
        }
      )
    );
  }

}
