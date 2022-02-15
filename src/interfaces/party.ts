export enum GuestState {
  unknown = "unknown",
  invited = "invited",
  maybe = "maybe",
  not_going = "not_going",
  going = "going",
}

export interface Guest {
  partyId: string;
  phoneNumber: string;
  guestName: string;
  guestState: GuestState;
}

export interface Party {
  partyId: string;
  partyName: string;
  guests: Guest[];
  createdAtMs: number;
  createdByUserPhoneNumber: string;
  scheduledForMs: number | null;
}
