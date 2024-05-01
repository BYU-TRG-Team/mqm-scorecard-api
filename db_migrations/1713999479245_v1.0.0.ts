/*
* Rename segment_issues table to errors
*/ 

import { MigrationBuilder } from "node-pg-migrate";

const segmentIssuesTable = "segment_issues"; // Deprecated
const errorsTable = "errors";

export const up = (pgm: MigrationBuilder) => {
  pgm.renameTable(segmentIssuesTable, errorsTable);
  pgm.renameConstraint(errorsTable, `${segmentIssuesTable}_issue_fkey`, `${errorsTable}_issue_fkey`);
  pgm.renameConstraint(errorsTable, `${segmentIssuesTable}_segment_id_fkey`, `${errorsTable}_segment_id_fkey`);
  pgm.renameConstraint(errorsTable, `${segmentIssuesTable}_pkey`, `${errorsTable}_pkey`);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.renameTable(errorsTable, segmentIssuesTable);
  pgm.renameConstraint(segmentIssuesTable, `${errorsTable}_issue_fkey`, `${segmentIssuesTable}_issue_fkey`);
  pgm.renameConstraint(segmentIssuesTable, `${errorsTable}_segment_id_fkey`, `${segmentIssuesTable}_segment_id_fkey`);
  pgm.renameConstraint(segmentIssuesTable, `${errorsTable}_pkey`, `${segmentIssuesTable}_pkey`);
};
