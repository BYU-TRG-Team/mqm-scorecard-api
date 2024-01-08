import { v4 as uuid } from "uuid";

interface MetricIssueInfo {
  metricIssueId?: string;
  projectId: string;
  issueId: string;
  isVisible: boolean;
}

class MetricIssue {
  public readonly metricIssueId: string;
  public readonly projectId: string;
  public readonly issueId: string;
  public readonly isVisible: boolean;

  constructor({
    metricIssueId = uuid(),
    projectId,
    issueId,
    isVisible
  }: MetricIssueInfo) {
    this.metricIssueId = metricIssueId;
    this.projectId = projectId;
    this.issueId = issueId;
    this.isVisible = isVisible;
  }
}

export default MetricIssue;