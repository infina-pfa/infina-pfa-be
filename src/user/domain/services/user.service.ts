export abstract class UserService {
  abstract handleUserSignedUp(userId: string, name: string): void;
}
