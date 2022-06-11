import { CoalitionChoice } from "../user.entity";

export interface UserInterface {
  name: string;
  email: string;
  password?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  socialChannel?: string;
  coalition?: CoalitionChoice;
  avatar?: string;
  createdAtt?: Date;
  updatedAt?: Date;
}
