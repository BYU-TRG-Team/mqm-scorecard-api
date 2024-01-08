import { v4 as uuid } from "uuid";

interface ProjectInfo {
  projectId?: string;
  name: string;
  metricFile: string;
  bitextFile: string;
  lastSegment: number;
  isFinished?: boolean;
  sourceWordCount?: number;
  targetWordCount?: number;
  specificationsFile?: string | null;
  specifications?: string | null
}

class Project {
  public readonly projectId: string;
  public name: string;
  public metricFile: string;
  public bitextFile: string;
  public lastSegment: number = 1;
  public isFinished: boolean = false;
  public sourceWordCount: number = 0;
  public targetWordCount: number = 0;
  public specificationsFile: string | null;
  public specifications: string | null;

  constructor({
    projectId = uuid(),
    name,
    metricFile,
    bitextFile, 
    lastSegment = 1,
    isFinished = false,
    sourceWordCount = 0,
    targetWordCount = 0,
    specificationsFile = null,
    specifications = null
  }: ProjectInfo) {
    this.projectId = projectId;
    this.name = name;
    this.metricFile = metricFile;
    this.bitextFile = bitextFile;
    this.lastSegment = lastSegment;
    this.isFinished = isFinished;
    this.sourceWordCount = sourceWordCount;
    this.targetWordCount = targetWordCount;
    this.specificationsFile = specificationsFile;
    this.specifications = specifications;
  }
}

export default Project;