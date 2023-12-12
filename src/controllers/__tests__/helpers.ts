export const setTestEnvironmentVars = () => {
  process.env.APP_ENV = "development";
  process.env.AUTH_SECRET = "foo";
  process.env.DATABASE_URL = "postgres://test-user:test-pw@foo:5432/bar";
  process.env.EMAIL_ADDRESS = "test@foobar.com";
  process.env.EMAIL_PASSWORD = "bar";
  process.env.EMAIL_PROVIDER = "Zoho";
};