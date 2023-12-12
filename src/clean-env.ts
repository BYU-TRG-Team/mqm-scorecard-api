import "dotenv/config";
import { cleanEnv, str, email, url } from "envalid";

export const constructCleanEnv = () => {
  return cleanEnv(process.env, {
    APP_ENV: str({ choices: ["development", "production"] }),
    AUTH_SECRET: str(),
    DATABASE_URL: url(),
    EMAIL_ADDRESS: email(),
    EMAIL_PASSWORD: str({ default: "" }),
    EMAIL_PROVIDER: str({ choices: ["Zoho", "SendGrid"] }),
    EMAIL_PROVIDER_API_KEY: str({ default: "" }),
  });
};

export type CleanEnv = ReturnType<typeof constructCleanEnv>;