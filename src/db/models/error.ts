import { ErrorSeverity, ErrorType } from "src/enums";
import { v4 as uuid } from "uuid";

interface ErrorInfo {
  errorId?: string;
  segmentId: string;
  issueId: string;
  severity: ErrorSeverity;
  type: ErrorType;
  note: string;
  highlightContent: string;
  highlightStartIndex: number;
  highlightEndIndex: number;
}

class Error {
  public readonly errorId: string;
  public readonly segmentId: string;
  public readonly issueId: string;
  public severity: ErrorSeverity;
  public readonly type: ErrorType;
  public note: string;
  public readonly highlightContent: string;
  public readonly highlightStartIndex: number;
  public readonly highlightEndIndex: number;

  constructor({
    errorId = uuid(),
    segmentId,
    issueId,
    severity,
    type,
    note,
    highlightContent,
    highlightStartIndex,
    highlightEndIndex
  }: ErrorInfo) {
    this.errorId = errorId;
    this.segmentId = segmentId;
    this.issueId = issueId;
    this.severity = severity;
    this.type = type;
    this.note = note;
    this.highlightContent = highlightContent;
    this.highlightStartIndex = highlightStartIndex;
    this.highlightEndIndex = highlightEndIndex;
  }
}

export default Error;