import { v4 as uuid } from "uuid";

interface SegmentInfo {
  segmentId?: string;
  projectId: string;
  source: string;
  target: string;
  segmentNumber: number;
}

class User {
  public readonly segmentId: string;
  public readonly projectId: string;
  public readonly source: string;
  public readonly target: string;
  public readonly segmentNumber: number;

  constructor({
   segmentId = uuid(),
   projectId,
   source,
   target,
   segmentNumber
  }: SegmentInfo) {
    this.segmentId = segmentId;
    this.projectId = projectId;
    this.source = source;
    this.target = target;
    this.segmentNumber = segmentNumber;
  }
}

export default User;