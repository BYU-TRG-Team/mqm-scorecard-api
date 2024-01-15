# MQM Scorecard API

RESTful HTTP API that stores and manages data for language translation evaluation using [MQM (Multidimensional Quality Metrics)](https://themqm.org/).

## Key Features

- **Project-based organization**: Translation evaluation is performed in the context of a project. Each project contains a bitext file (source/target segments), a metrics file (quality metrics), and an optional specifications file (project requirements).
- **JSON reports**: Provides project information and translation results.

## Installation

### Install Node.js and a PostgreSQL instance

- Node.js 16.x will be needed. Reference the [Node.js documentation](https://nodejs.org/en/download/package-manager) for installaton.
- A PostgreSQL 9.x instance will be needed. Reference the [PostgreSQL downloads](https://www.postgresql.org/download/) for installation.

### Third-party Requirements

**MQM Scorecard requires a third party email provider**. MQM Scorecard currently supports integration with either **Zoho Mail** and **SendGrid**. 

#### Zoho Mail setup

Visit the [Zoho Mail](https://www.zoho.com/mail) website for more information on setting up an email account. 

If MFA is enabled, an [app-specific password](https://help.zoho.com/portal/en/kb/bigin/channels/email/articles/generate-an-app-specific-password) will need to be generated and used with MQM Scorecard instead of the account password.

#### SendGrid setup

Visit the [SendGrid](https://sendgrid.com) website for more information on setting up an email account. 

An [API key](https://docs.sendgrid.com/ui/account-and-settings/api-keys) will need to be generated with full access to be used with MQM scorecard.

### Setup environment variables

The following environment variables will either need to be exported in the shell context or defined in a `.env` file in the repo root. 

```
APP_ENV=<development | production>
DATABASE_URL=<url for the database>
EMAIL_ADDRESS=<address from which emails will be sent>
EMAIL_PROVIDER=<Zoho | SendGrid>
EMAIL_PASSWORD=<password for hosted email account (used for Zoho only)>
EMAIL_PROVIDER_API_KEY=<API key generated by email provider (used for SendGrid only)>
AUTH_SECRET=<64-bit CSPRNG secret>
```

### Install Node modules

```
npm ci
```

### Build the app

```
npm run build
```

### Configure the database

Database configuration is versioned using a library called [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate), a Node.js database migration management tool built exclusively for PostgreSQL. Migrations are located in the `/db_migrations` folder. For a fresh install, all migrations will need to run. 

*Before using the tool, ensure that NPM packages are installed by running `npm ci` and that environment variables are either exported in the shell context or defined in a `.env` file in the repo root.*

```
npm run migrate up
```

### Launch 

```
npm run start
```

## Scripts

### Set user role

Sets the role for a given user.

*Before using the tool, ensure that NPM packages are installed by running `npm ci` and that environment variables are either exported in the shell context or defined in a `.env` file in the repo root.*

```
npm run db:set-user-role <username> <role id>

Valid role id: 1 (user) | 2 (admin) | 3 (superadmin)
```


## Error Severity Weights

- Netural: 0
- Minor: 1
- Major: 5
- Critical: 25

## Project JSON Output 

The JSON output for a project is structured as defined below: 

```
{
    projectName: string,
    key: {
        [key: string]: string        
    }, // Map of segment IDs to segment numbers
    errors: {
        segment: string,
        target: string,
        name: string,
        severity: string,
        issueReportId: string,
        issueId: string,
        note: string,
        highlighting: {
            startIndex: number,
            endIndex: number
        }
    }[],
    metric: {
        parent: string | null,
        name: string,
        description: string,
        notes: string,
        examples: string,
        issueId: string
    }[],
    apt: number, // Absolute Penalty Total
    segments: {
        source: string[],
        target: string[],
    }
}
```

### Example

```
{
  "projectName": "Testing-123",
  "key": {
    "57": "1",
    "58": "2",
    "59": "3",
  },
  "errors": [
    {
      "segment": "57",
      "target": "target",
      "name": "inconsistent use of terminology",
      "severity": "minor",
      "issueReportId": "4",
      "issueId": "term-inconsistency",
      "note": "||major; language register; R; 2",
      "highlighting": {
        "startIndex": 168,
        "endIndex": 172
      }
    },
    {
      "segment": "57",
      "target": "target",
      "name": "multiple terms in translation",
      "severity": "minor",
      "issueReportId": "5",
      "issueId": "multiple-translations-of-term",
      "note": "||in which; function words; G; 1",
      "highlighting": {
        "startIndex": 180,
        "endIndex": 187
      }
    },
    {
      "segment": "58",
      "target": "target",
      "name": "Terminology",
      "severity": "minor",
      "issueReportId": "6",
      "issueId": "terminology",
      "note": "||somebody had to doubt it; unidiomatic style; U; 2",
      "highlighting": {
        "startIndex": 14,
        "endIndex": 37
      }
    },
  ],
  "metric": [
    {
      "parent": null,
      "name": "Terminology",
      "description": "A term (domain-specific word) is translated with a term other than the one expected for the domain or otherwise specified.",
      "notes": "All errors specifically related to use of domain- or organization-specific terminology are included in this error and its children.\r\n\r\nDo not use this error if a text is simply mistranslated, i.e., if the translation would be a valid translation of the source but simply does not use the particular mandated terminology. For example, if a text translates [river] bank into Spanish as banco (a financial institution) instead of orilla (a river bank), this would be a mistranslation because banco would never be a valid term for the concept of a river bank. However, if a termbase specified that orilla should be used and the translation uses ribera instead, this would be a Terminology error because ribera is a valid term for the concept, but not the specified one.",
      "examples": "A French text translates English \"email\" as \"e-mail\" but terminology guidelines mandated that \"courriel\" be used.\n\nThe English musicological term dog is translated (literally) into German as Hund instead of as Schnarre, as specified in a terminology database.",
      "issueId": "terminology"
    },
    {
      "parent": "terminology",
      "name": "inconsistent use of terminology",
      "description": "A single concept is expressed with multiple terms.",
      "notes": "This error is used only to address inconsistent use of terminology in the target text. In cases where terminology is incorrect for the domain or termbase, wrong term or termbase should be used instead. If the inconsistent term use can be traced back to inconsist term use in the source text, the error type stays the same, but this special case should be annotated with an inconsistent source term root cause.",
      "examples": "A German source text uses one term for a component of a vehicle, but the target text uses “brake release lever”, “brake disengagement lever”, “manual brake release”, and “manual disengagement release” for this term in English.",
      "issueId": "term-inconsistency"
    },
    {
      "parent": "term-inconsistency",
      "name": "multiple terms in translation",
      "description": "A single source term is translated in multiple inconsistent ways.",
      "notes": "Applies to target text only since it refers to cases where one term has multiple translations. As with term-inconsistency, termbase or one of its children should be used instead if a termbase contains a specified term for a concept and the text does not use that particular term.",
      "examples": "A German source text uses one term for a component of a vehicle, but the target text uses “brake release lever”, “brake disengagement lever”, “manual brake release”, and “manual disengagement release” for this term in English.",
      "issueId": "multiple-translations-of-term"
    },
  ],
  "apt": 3,
  "segments": {
    "source": [
      "Foi no penúltimo domingo de Janeiro de 1645, quando o conde Peter van Heest conclamou o povo do Recife — a \"grande e florescente\" capital do Brasil holandês — a comparecer a uma grande festa na qual, garantiu, um cavalo iria voar. ",
      "Houve logo quem duvidasse, é claro. ",
      "Mas até os mais céticos devem ter hesitado antes de rir na cara do conde. ",
    ],
    "target": [
      " Count Peter van Heest, on the next to the last Sunday of January, 1645, summoned the people of Recife — the \"great and thriving\" capital of Dutch Brazil — to attend a major party in which he guaranteed that a horse was going to fly.",
      " Immediately, somebody had to doubt it, of course.",
      " However, even the most skeptical ones must have hesitated before laughing at the count.",
    ],
  }
}
```

