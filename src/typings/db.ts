import { Pool, PoolClient } from "pg";
import { ErrorSeverity, ErrorType, Role } from "../enums";

export type DBClient = Pool | PoolClient;

export interface ProjectSchema {
  project_id: string;
  name: string;
  metric_file: string;
  bitext_file: string;
  last_segment: number;
  is_finished: boolean;
  source_word_count: number;
  target_word_count: number;
  specifications_file: string | null;
  specifications: string | null;
}

export interface UserSchema {
  user_id: string;
  username: string;
  verified: boolean;
  password: string;
  email: string;
  name: string;
  role: Role;
  reset_password_token: string | null;
  reset_password_token_created_at: Date | null;
  email_verification_token: string | null;
  email_verification_token_created_at: Date | null;
}

export interface IssueSchema {
  issue_id: string;
  parent: string | null;
  name: string;
  description: string | null;
  notes: string | null;
  examples: string | null;
}

export interface SegmentSchema {
  segment_id: string;
  project_id: string;
  source: string;
  target: string;
  segment_number: number;
}

export interface ProjectUserSchema {
  id: string;
  project_id: string;
  user_id: string;
}

export interface ErrorSchema {
  error_id: string;
  segment_id: string;
  issue_id: string;
  severity: ErrorSeverity;
  type: ErrorType,
  note: string,
  highlight_content: string,
  highlight_start_index: number,
  highlight_end_index: number
}

export interface MetricIssueSchema {
  metric_issue_id: string;
  project_id: string;
  issue_id: string;
  is_visible: boolean;
}

export interface ProjectReportQuery extends IssueSchema {
  type: null | ErrorType[];
  severity: null | ErrorSeverity[];
}