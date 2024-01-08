interface IssueInfo {
  issueId: string;
  parent?: string | null;
  name: string;
  description?: string | null;
  notes?: string | null;
  examples?: string | null;
}

class Issue {
  public readonly issueId: string;
  public readonly parent: string | null;
  public readonly name: string;
  public readonly description: string | null;
  public readonly notes: string | null;
  public readonly examples: string | null;

  constructor({
    issueId,
    parent = null,
    name,
    description = null,
    notes = null,
    examples = null
  }: IssueInfo) {
    this.issueId = issueId;
    this.parent = parent;
    this.name = name;
    this.description = description;
    this.notes = notes;
    this.examples = examples;
  }
}

export default Issue;