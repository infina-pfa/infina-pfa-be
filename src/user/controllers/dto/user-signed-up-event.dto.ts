import { IsNotEmpty, IsObject } from 'class-validator';

export class UserSignedUpEventDto {
  @IsObject()
  @IsNotEmpty()
  record: {
    id: string;
    email: string;
    phone: string;
  };
}
