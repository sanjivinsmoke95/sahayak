export interface Profile {
  id: string;
  name: string;
  relationship: string;
  isSelf: boolean;
}

export interface ProfileCreatePayload {
  name: string;
  relationship: string;
}
