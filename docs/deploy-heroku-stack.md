# Deploy Heroku stack

Many of the API routes require permissions granted through the auth flow of the [MQM Scorecard](https://github.com/BYU-TRG-Team/mqm-scorecard) application, which is currently the only consumer of this API.

## Heroku setup 

1. Create a Heroku account.
2. [Install the Heroku CLI and login with your account](https://devcenter.heroku.com/articles/heroku-cli).
3. [Create a new Heroku app](https://devcenter.heroku.com/articles/creating-apps). 
    - **Make note of the app name**. 
    - The newly created app will use the lowest plan/tier by default (Eco). Please reference [this guide](https://www.heroku.com/dynos) to assess different tiers offered by Heroku, and [this guide](https://devcenter.heroku.com/articles/dyno-types#from-the-heroku-dashboard) if you wish to adjust the tier type of the app.
4. [Provision a Heroku Postgres instance for your app](https://devcenter.heroku.com/articles/provisioning-heroku-postgres).
    - The minimum plan needed for a small number of users and projects is **Basic**.
    - Refer to [this guide](https://devcenter.heroku.com/articles/heroku-postgres-plans) to learn more about Heroku Postgres plans.


## Create an account with a supported email provider

Refer to [third-party requirements in the README](../README.md#third-party-requirements). 

## Set environment variables

Refer to [environment variables in the README](../README.md#setup-environment-variables). Environment variables can either be set [using the CLI or the Heroku Dashboard](https://devcenter.heroku.com/articles/config-vars).

## Deploy application to Heroku

1. [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
2. Clone the repository and checkout the latest release:

```
git clone https://github.com/BYU-TRG-Team/mqm-scorecard-api.git
cd mqm-scorecard-api
LATEST_TAG=$(git describe --tags --abbrev=0)
git checkout tags/"${LATEST_TAG}" -b "${LATEST_TAG}"
```

3. Retrieve the database url from Heroku, and run the following commands to configure the database:

```
npm ci
DATABASE_URL=<url for the database> \
APP_ENV=production \
PGSSLMODE=no-verify \
npm run migrate up
```

4. [Create a Git remote for Heroku](https://devcenter.heroku.com/articles/git#create-a-heroku-remote).
5. [Deploy the git repo to Heroku](https://devcenter.heroku.com/articles/git#deploy-your-code).

Your application should now be available at the following url:

```
https://<app-name>.herokuapp.com
```


## Configure initial user

1. Create a new user on Scorecard
2. Give **superadmin** privileges to the user:

```
DATABASE_URL=<url for the database> \ 
APP_ENV=production \
npm run db:set-user-role <username> 3
```