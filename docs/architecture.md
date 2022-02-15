# Engineering Architecture

## Access Patterns

[See product-requirements.md#Access-Patterns](product-requirements.md#Access-Patterns)

## Database Choice

- For each event, an optional potluck entity can be created if the host selects that a party is a potluck
- A potluck entity can be represented as a table, in which case I’d choose to use a NoSQL database like DynamoDB or MongoDB. The entire list of potluck items and it’s claim status could be nested under this schema-less Potluck entity. Choosing NoSQL here has an advantage in being faster to query as we can avoid joins across tables to view the status of an entire potluck.
  - Considering our expected usage patterns, we will frequently make queries to get the combination of potluck, potluck items, and potluck item claimants. It would be performant to store these in the same NoSQL table, which can be done by having each entity share the same primary key, while having unique secondary keys.

## DynamoDB Schema

```
{
  TableName: "QuickPotlucks",
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" },
    { AttributeName: "SK", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" }
  ],
}
```

### Potluck

```
{
  PK: PARTY#<PARTY_ID>,
  SK: METADATA#<PARTY_ID>
}
```

### Potluck Item

```
{
  PK: PARTY#<PARTY_ID>,
  SK: PLI#<ITEM_NAME>
}
```

- Need to make sure the SK was went after "METADATA" alphanumerically so we can write a query to get party metadata and items together in one call.

### Potluck Item Claimant

```
{
  PK: PARTY#<PARTY_ID>,
  SK: PLIC#<PHONE_NUMBER>$PLI#<ITEM_NAME>
}
```

- The secondary key looks complex but it was needed to avoid duplicates, since we need to account for possibility that a guest has a claim over multiple items, and that an item can have multiple claimants.
