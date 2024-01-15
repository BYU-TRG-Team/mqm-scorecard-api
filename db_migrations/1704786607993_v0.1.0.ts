/*
* This initial migration was derived from a script that used SQL queries to create all of the tables. 
* 
* To safely migrate to using node-pg-migrate, tables are created only if they don't already exist.
* 
* Similarly, constraints are dropped if they already exist and recreated.
*/ 

import { MigrationBuilder } from "node-pg-migrate";

const usersTable = "users";
const tokensTable = "tokens";
const projectsTable = "projects";
const issuesTable = "issues";
const userProjectsTable = "user_projects";
const projectIssuesTable = "project_issues";
const segmentsTable = "segments";
const segmentIssuesTable = "segment_issues";

const createUsersTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    usersTable, 
    {
      user_id: { type: "serial", primaryKey: true },
      username: { type: "text", unique: true, notNull: true },
      verified: { type: "boolean", default: false },
      password: { type: "text", notNull: true },
      email: { type: "text", unique: true, notNull: true },
      name: { type: "text", notNull: true },
      role_id: { type: "integer", notNull: true },
      reset_password_token: { type: "text" },
      reset_password_token_created_at: { type: "timestamptz" }
    },
    { 
      ifNotExists: true 
    }
  );
};

const createTokensTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    tokensTable, 
    {
      user_id: { type: "integer", notNull: true },
      token: { type: "text", primaryKey: true },
    },
    { 
      ifNotExists: true 
    }
  );

  pgm.dropConstraint(
    tokensTable, 
    `${tokensTable}_user_id_fkey`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    tokensTable, 
    `${tokensTable}_user_id_fkey`, 
    {
      foreignKeys: {
        columns: "user_id",
        references: `${usersTable} (user_id)`,
        onDelete: "CASCADE",
      }
    }
  );
};

const createProjectsTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    projectsTable, 
    {
      project_id: { type: "serial", primaryKey: true },
      name: { type: "text", notNull: true },
      specifications_file: { type: "text", default: null },
      metric_file: { type: "text", notNull: true },
      bitext_file: { type: "text", notNull: true },
      specifications: { type: "text", default: null },
      last_segment: { type: "integer", notNull: true, default: 1 },
      finished: { type: "boolean", notNull: true, default: false },
      source_word_count: { type: "integer", notNull: true, default: 0 },
      target_word_count: { type: "integer", notNull: true, default: 0 }
    },
    { 
      ifNotExists: true 
    }
  );
};

const createIssuesTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    issuesTable, 
    {
      id: { type: "text", primaryKey: true },
      parent: { type: "text", default: null },
      name: { type: "text", notNull: true },
      description: { type: "text", default: null },
      notes: { type: "text", default: null },
      examples: { type: "text", default: null }
    },
    { 
      ifNotExists: true 
    }
  );
};

export const createUserProjectsTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    userProjectsTable,
    {
      project_id: { type: "integer", notNull: true },
      user_id: { type: "integer", notNull: true },
    },
    { 
      ifNotExists: true 
    }
  );
 
  pgm.dropConstraint(
    userProjectsTable, 
    `${userProjectsTable}_project_id_user_id_key`, 
    { 
      ifExists: true 
    }
  );
 
  pgm.addConstraint(
    userProjectsTable, 
    `${userProjectsTable}_project_id_user_id_key`, 
    {
      unique: ["project_id", "user_id"]
    }
  );
 
  pgm.dropConstraint(
    userProjectsTable, 
    `${userProjectsTable}_project_id_fkey`, 
    { 
      ifExists: true 
    }
  );
 
  pgm.addConstraint(
    userProjectsTable, 
    `${userProjectsTable}_project_id_fkey`, 
    {
      foreignKeys: {
        columns: "project_id",
        references: `${projectsTable} (project_id)`,
        onDelete: "CASCADE",
      }
    }
  );
 
  pgm.dropConstraint(
    userProjectsTable, 
    `${userProjectsTable}_user_id_fkey`, 
    { 
      ifExists: true 
    }
  );
 
  pgm.addConstraint(
    userProjectsTable, 
    `${userProjectsTable}_user_id_fkey`, 
    {
      foreignKeys: {
        columns: "user_id",
        references: `${usersTable} (user_id)`,
        onDelete: "CASCADE",
      }
    }
  );
};

export const createProjectIssuesTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    projectIssuesTable, 
    {
      id: { type: "serial", primaryKey: true },
      project_id: { type: "integer", notNull: true },
      issue: { type: "text", notNull: true },
      display: { type: "boolean", notNull: true },
    },
    { 
      ifNotExists: true 
    }
  );

  pgm.dropConstraint(
    projectIssuesTable, 
    `${projectIssuesTable}_issue_fkey`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    projectIssuesTable, 
    `${projectIssuesTable}_issue_fkey`, 
    {
      foreignKeys: {
        columns: "issue",
        references: `${issuesTable} (id)`,
        onDelete: "CASCADE",
      }
    },
  );

  pgm.dropConstraint(
    projectIssuesTable, 
    `${projectIssuesTable}_project_id_fkey`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    projectIssuesTable, 
    `${projectIssuesTable}_project_id_fkey`, 
    {
      foreignKeys: {
        columns: "project_id",
        references: `${projectsTable} (project_id)`,
        onDelete: "CASCADE",
      }
    }
  );
};

export const createSegmentsTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    segmentsTable, 
    {
      id: { type: "serial", primaryKey: true },
      project_id: { type: "integer", notNull: true },
      segment_data: { type: "jsonb", notNull: true },
      segment_num: { type: "integer", notNull: true },
    },
    { 
      ifNotExists: true 
    }
  );

  pgm.dropConstraint(
    segmentsTable, 
    `${segmentsTable}_project_id_segment_num_key`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    segmentsTable, 
    `${segmentsTable}_project_id_segment_num_key`, 
    {
      unique: ["project_id", "segment_num"]
    }
  );

  pgm.dropConstraint(
    segmentsTable, 
    `${segmentsTable}_project_id_fkey`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    segmentsTable, 
    `${segmentsTable}_project_id_fkey`, 
    {
      foreignKeys: {
        columns: "project_id",
        references: `${projectsTable} (project_id)`,
        onDelete: "CASCADE",
      }
    }
  );
};

export const createSegmentIssuesTable = (pgm: MigrationBuilder) => {
  pgm.createTable(
    segmentIssuesTable, 
    {
      id: { type: "serial", primaryKey: true },
      segment_id: { type: "integer", notNull: true },
      issue: { type: "text", notNull: true },
      level: { type: "text", notNull: true },
      type: { type: "text", notNull: true }, 
      highlighting: { type: "text", notNull: true },
      note: { type: "text", notNull: true },
      highlight_start_index: { type: "integer", notNull: true },
      highlight_end_index: { type: "integer", notNull: true },
    },
    { 
      ifNotExists: true 
    }
  );

  pgm.dropConstraint(
    segmentIssuesTable, 
    `${segmentIssuesTable}_issue_fkey`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    segmentIssuesTable, 
    `${segmentIssuesTable}_issue_fkey`, 
    {
      foreignKeys: {
        columns: "issue",
        references: `${issuesTable} (id)`,
        onDelete: "CASCADE",
      }
    }
  );

  pgm.dropConstraint(
    segmentIssuesTable, 
    `${segmentIssuesTable}_segment_id_fkey`, 
    { 
      ifExists: true 
    }
  );

  pgm.addConstraint(
    segmentIssuesTable, 
    `${segmentIssuesTable}_segment_id_fkey`, 
    {
      foreignKeys: {
        columns: "segment_id",
        references: `${segmentsTable} (id)`,
        onDelete: "CASCADE",
      }
    }
  );
};

export const up = (pgm: MigrationBuilder) => {
  createUsersTable(pgm);
  createTokensTable(pgm);
  createProjectsTable(pgm);
  createIssuesTable(pgm);
  createUserProjectsTable(pgm);
  createProjectIssuesTable(pgm);
  createSegmentsTable(pgm);
  createSegmentIssuesTable(pgm);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable(segmentIssuesTable);
  pgm.dropTable(segmentsTable);
  pgm.dropTable(projectIssuesTable);
  pgm.dropTable(userProjectsTable);
  pgm.dropTable(issuesTable);
  pgm.dropTable(projectsTable);
  pgm.dropTable(tokensTable);
  pgm.dropTable(usersTable);
};
