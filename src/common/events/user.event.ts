export enum UserEvent {
  USER_SIGNED_UP = 'user.signedUp',
}

export type UserSignedUpEventPayload = {
  userId: string;
  name: string;
};
