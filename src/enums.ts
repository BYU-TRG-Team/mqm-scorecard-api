export enum EmailProvider {
  SendGrid = "SendGrid",
  Zoho = "Zoho"
}

export enum AppEnv {
  Development = "development",
  Production = "production"
}

export enum Role {
  User = 1,
  Staff = 2,
  Admin = 3
}

export enum ErrorSeverity {
  Netural = "netural",
  Minor = "minor",
  Major = "major",
  Critical = "critical"
}

export enum ErrorType {
  Source = "source",
  Target = "target"
}