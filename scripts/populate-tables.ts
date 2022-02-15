import { GuestState } from "../src/interfaces";
import QuickPartiesRepository from "../src/repositories/quickparties";
import QuickPotlucksRepository from "../src/repositories/quickpotluck";


async function populate() {
  const partiesRepo = new QuickPartiesRepository();
  const potluckRepo = new QuickPotlucksRepository();
  await partiesRepo.createParty({
    partyId: 'PARTY_ID',
    partyName: "Test Party",
    guests: [],
    createdAtMs: Date.now(),
    createdByUserPhoneNumber: '7034720567',
    scheduledForMs: Date.now(),
  });

  await partiesRepo.createGuest(
    'PARTY_ID',
    {
      partyId: 'PARTY_ID',
      phoneNumber: '1111111111',
      guestName: 'Chelsy',
      guestState: GuestState.going,
    }
  );
  await potluckRepo.createPotluck(
    {
      partyId: 'PARTY_ID',
      potluckItems: []
    }
  );
  await potluckRepo.requestPotluckItem('PARTY_ID', {
    itemName: 'Wine',
    quantityClaimed: 0,
    quantityRequested: 3,
    isRequired: true,
    requestedByPhoneNumber: '7034720567', 
    claimants: {},
  });
  await potluckRepo.scan();

  try {
    await potluckRepo.requestPotluckItem('PARTY_ID', {
      itemName: 'Wine',
      quantityClaimed: 0,
      quantityRequested: 1,
      isRequired: true,
      requestedByPhoneNumber: '1111111111', 
      claimants: {},
    });
  } catch {
    console.error('Successfully rejected a duplicate potluck item')
  }

  await potluckRepo.requestPotluckItem('PARTY_ID', {
    itemName: 'Cheese',
    quantityClaimed: 0,
    quantityRequested: 10,
    isRequired: false,
    requestedByPhoneNumber: '7034720567', 
    claimants: {},
  });
  await potluckRepo.scan();
  

  await potluckRepo.claimPotluckItem('PARTY_ID', 'Wine', { itemName: 'Wine', quantityClaimed: 2, phoneNumber: '7034720567', claimedAtMs: Date.now(), description: 'Prosecco' });
  await potluckRepo.scan();

  await potluckRepo.claimPotluckItem('PARTY_ID', 'Wine', { itemName: 'Wine', quantityClaimed: 2, phoneNumber: '1111111111', claimedAtMs: Date.now(), description: 'Cabernet' });
  await potluckRepo.scan();

  console.log(await potluckRepo.getPotluckWithItems('PARTY_ID'));
}

populate();
