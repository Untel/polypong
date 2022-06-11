import { CoalitionChoice } from "../user.entity";

export interface UserInterface {
  name: string;
  email: string;
  password?: string;
  isActive?: boolean;
  email_verified?: boolean;
  social_channel?: string;
  coalition?: CoalitionChoice;
  avatar?: string;
  created_at?: Date;
  updated_at?: Date;
}
