export interface PotluckItemClaimant {
  itemName: string;
  phoneNumber: string;
  quantityClaimed: number;
  claimedAtMs: number;
  description?: string;
}

export interface PotluckItem {
  itemName: string;
  quantityRequested: number;
  quantityClaimed: number; // Denormalized. Must match source of truth in claimants field (summation of each claimant's quantityClaimed)
  isRequired: boolean;
  requestedByPhoneNumber: string;
  claimants: { [phoneNumber: string]: PotluckItemClaimant };
}

export interface Potluck {
  partyId: string;
  potluckItems: PotluckItem[];
}
