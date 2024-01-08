import { ErrorSchema, IssueSchema, MetricIssueSchema, ProjectSchema, SegmentSchema, UserSchema } from "../../typings/db";
import User from "../models/user";
import Project from "../models/project";
import Issue from "../models/issue";
import Segment from "../models/segment";
import Error from "../models/error";
import MetricIssue from "../models/metric-issue";

export const convertRawProjectToProjectModel = (rawProject: ProjectSchema) => {
  return new Project({
    projectId: rawProject.project_id,
    name: rawProject.name,
    metricFile: rawProject.metric_file,
    bitextFile: rawProject.bitext_file,
    lastSegment: rawProject.last_segment,
    isFinished: rawProject.is_finished,
    sourceWordCount: rawProject.source_word_count,
    targetWordCount: rawProject.target_word_count,
    specificationsFile: rawProject.specifications_file,
    specifications: rawProject.specifications
  });
}

export const convertRawUserToUserModel = (rawUser: UserSchema) => {
  return new User({
    userId: rawUser.user_id,
    username: rawUser.username,
    verified: rawUser.verified,
    password: rawUser.password,
    email: rawUser.email,
    name: rawUser.name,
    role: rawUser.role,
    resetPasswordToken: rawUser.reset_password_token,
    resetPasswordTokenCreatedAt: rawUser.reset_password_token_created_at,
    emailVerificationToken: rawUser.email_verification_token,
    emailVerificationTokenCreatedAt: rawUser.email_verification_token_created_at
  });
}

export const convertRawIssueToIssueModel = (rawIssue: IssueSchema) => {
  return new Issue({
    issueId: rawIssue.issue_id,
    parent: rawIssue.parent,
    name: rawIssue.name,
    description: rawIssue.description,
    notes: rawIssue.notes,
    examples: rawIssue.examples
  });
}

export const convertRawSegmentToSegmentModel = (rawSegment: SegmentSchema) => {
  return new Segment({
    segmentId: rawSegment.segment_id,
    projectId: rawSegment.project_id,
    source: rawSegment.source,
    target: rawSegment.target,
    segmentNumber: rawSegment.segment_number
  })
}

export const convertRawErrorToErrorModel = (rawError: ErrorSchema) => {
  return new Error({
    errorId: rawError.error_id,
    segmentId: rawError.segment_id,
    issueId: rawError.issue_id,
    severity: rawError.severity,
    type: rawError.type,
    note: rawError.note,
    highlightContent: rawError.highlight_content,
    highlightStartIndex: rawError.highlight_start_index,
    highlightEndIndex: rawError.highlight_end_index
  })
}

export const convertRawMetricIssueToMetricIssueModel = (rawMetricIssue: MetricIssueSchema) => {
  return new MetricIssue({
    metricIssueId: rawMetricIssue.metric_issue_id,
    projectId: rawMetricIssue.project_id,
    issueId: rawMetricIssue.issue_id,
    isVisible: rawMetricIssue.is_visible
  })
}