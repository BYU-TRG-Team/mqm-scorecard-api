import { v4 as uuid } from "uuid";
import { Role } from  "../../enums";

interface UserInfo {
  userId?: string;
  username: string;
  verified?: boolean;
  password: string;
  email: string;
  name: string;
  role?: Role;
  resetPasswordToken?: string | null;
  resetPasswordTokenCreatedAt?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationTokenCreatedAt?: Date | null;
}

class User {
  public readonly userId: string;
  public username: string;
  public verified: boolean;
  public password: string;
  public email: string;
  public name: string;
  public role: Role;
  public resetPasswordToken: string | null;
  public resetPasswordTokenCreatedAt: Date | null;
  public emailVerificationToken: string | null;
  public emailVerificationTokenCreatedAt: Date | null;

  constructor({
   userId = uuid(),
   username,
   verified = false,
   password,
   email,
   name,
   role = Role.User,
   resetPasswordToken = null,
   resetPasswordTokenCreatedAt = null,
   emailVerificationToken = null,
   emailVerificationTokenCreatedAt = null
  }: UserInfo) {
    this.userId = userId;
    this.username = username;
    this.verified = verified;
    this.password = password;
    this.email = email;
    this.name = name;
    this.role = role;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordTokenCreatedAt = resetPasswordTokenCreatedAt;
    this.emailVerificationToken = emailVerificationToken;
    this.emailVerificationTokenCreatedAt = emailVerificationTokenCreatedAt;
  }
}

export default User;