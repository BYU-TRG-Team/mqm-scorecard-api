import { constructBottle } from "../bottle";

const bottle = constructBottle();
const dropUserTable = `
DROP TABLE IF EXISTS user CASCADE;
`;
const dropProjectTable = `
DROP TABLE IF EXISTS project CASCADE;
`;
const dropProjectUserTable = `
DROP TABLE IF EXISTS project_user CASCADE;
`;
const dropIssueTable = `
DROP TABLE IF EXISTS issue CASCADE;
`;
const dropSegmentTable = `
DROP TABLE IF EXISTS segment CASCADE;
`;
const dropErrorTable = `
DROP TABLE IF EXISTS error CASCADE;
`;
const dropMetricIssueTable = `
DROP TABLE IF EXISTS metric_issue CASCADE;
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createUserTable = `
CREATE TABLE IF NOT EXISTS user(
user_id uuid PRIMARY KEY,
username text UNIQUE NOT NULL,
verified boolean DEFAULT FALSE,
password text NOT NULL,
email text UNIQUE NOT NULL,
name text NOT NULL,
role integer NOT NULL DEFAULT 1,
reset_password_token text DEFAULT NULL,
reset_password_token_created_at timestamp WITH TIME ZONE DEFAULT NULL
email_verification_token text DEFAULT NULL,
email_verification_token_created_at timestamp WITH TIME ZONE DEFAULT NULL
);
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createProjectTable = `
CREATE TABLE IF NOT EXISTS project(
project_id uuid PRIMARY KEY,
name text NOT NULL,
specifications_file text DEFAULT NULL,
metric_file text NOT NULL,
bitext_file text NOT NULL,
specifications text DEFAULT NULL,
last_segment integer NOT NULL DEFAULT 1,
is_finished boolean NOT NULL DEFAULT FALSE,
source_word_count integer NOT NULL DEFAULT 0,
target_word_count integer NOT NULL DEFAULT 0
);
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createProjectUserTable = `
CREATE TABLE IF NOT EXISTS project_user(
project_id uuid NOT NULL,
user_id uuid NOT NULL,
FOREIGN KEY (user_id)
REFERENCES user (user_id) ON DELETE CASCADE,
FOREIGN KEY (project_id)
REFERENCES project (project_id) ON DELETE CASCADE,
PRIMARY KEY (project_id, user_id)
);
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createIssueTable = `
CREATE TABLE IF NOT EXISTS issue(
issue_id text PRIMARY KEY,
parent text DEFAULT NULL, 
name text NOT NULL,
description text DEFAULT NULL,
notes text DEFAULT NULL,
examples text DEFAULT NULL
);
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createSegmentTable = `
CREATE TABLE IF NOT EXISTS segment(
segment_id uuid PRIMARY KEY,
project_id uuid NOT NULL,
source text NOT NULL,
target text NOT NULL,
segment_number integer NOT NULL,
FOREIGN KEY (project_id)
REFERENCES project (project_id) ON DELETE CASCADE,
UNIQUE(project_id, segment_number)
);
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createErrorTable = `
CREATE TABLE IF NOT EXISTS error(
error_id uuid PRIMARY KEY,
segment_id uuid NOT NULL,
issue_id text NOT NULL,
severity text NOT NULL,
type text NOT NULL,
note text NOT NULL,
highlight_content text NOT NULL,
highlight_start_index integer NOT NULL,
highlight_end_index integer NOT NULL,
FOREIGN KEY (segment_id)
REFERENCES segment (segment_id) ON DELETE CASCADE,
FOREIGN KEY (issue_id)
REFERENCES issues (issue_id) ON DELETE CASCADE
);
`;

// TODO: Use https://www.npmjs.com/package/node-pg-migrate
const createMetricIssueTable = `
CREATE TABLE IF NOT EXISTS metric_issue(
metric_issue_id uuid PRIMARY KEY,
project_id uuid NOT NULL,
issue_id text NOT NULL,
is_visible boolean NOT NULL,
FOREIGN KEY (project_id)
REFERENCES project (project_id) ON DELETE CASCADE,
FOREIGN KEY (issue)
REFERENCES issue (issue_id) ON DELETE CASCADE
);
`;

(async function seedDatabase() {
  await bottle.container.DBClientPool.connectionPool.query(dropUserTable);
  await bottle.container.DBClientPool.connectionPool.query(dropIssueTable);
  await bottle.container.DBClientPool.connectionPool.query(dropProjectTable);
  await bottle.container.DBClientPool.connectionPool.query(dropMetricIssueTable);
  await bottle.container.DBClientPool.connectionPool.query(dropProjectUserTable);
  await bottle.container.DBClientPool.connectionPool.query(dropSegmentTable);
  await bottle.container.DBClientPool.connectionPool.query(dropErrorTable);
  await bottle.container.DBClientPool.connectionPool.query(createUserTable);
  await bottle.container.DBClientPool.connectionPool.query(createProjectTable);
  await bottle.container.DBClientPool.connectionPool.query(createIssueTable);
  await bottle.container.DBClientPool.connectionPool.query(createMetricIssueTable);
  await bottle.container.DBClientPool.connectionPool.query(createSegmentTable);
  await bottle.container.DBClientPool.connectionPool.query(createProjectUserTable);
  await bottle.container.DBClientPool.connectionPool.query(createErrorTable);
  await bottle.container.DBClientPool.connectionPool.end();
  console.log("Successfully configured database");
}());
