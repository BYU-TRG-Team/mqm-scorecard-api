import { getMockReq, getMockRes } from "@jest-mock/express";
import { constructBottle } from '../../../bottle';
import ProjectService from "../../../services/project.service";
import IssueService from "../../../services/issue.service";
import SegmentService from "../../../services/segment.service";
import { setTestEnvironmentVars } from '../helpers';

jest.mock("pg");
jest.mock('nodemailer');

describe('tests getProjectJSONReport method', () => {
  beforeEach(() => {
    setTestEnvironmentVars();
    jest.restoreAllMocks();
  });

  it('should successfully get project not assigned to user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'superadmin',
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectById").mockResolvedValueOnce({ 
      rows: [{ project_id: 1, source_word_count: 200, target_word_count: 300, name: 'test' }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getProjectIssuesById").mockResolvedValueOnce({ 
      rows: [
        {
          issue: 'locale-specific-punctuation',
          parent: null,
          name: 'locale-specific punctuation',
          description: 'The text systematically uses punctuation marks that are not appropriate for the specified locale.',
          notes: '',
          examples: 'A text translated from English to Japanese maintains European-style punctuation—such as full-stops (.)—instead of using the appropriate Japanese punctuation, such as the Japanese full stop (。).',
        },
        {
          issue: 'national-language-standard',
          parent: 'locale-specific-punctuation',
          name: 'national language standard',
          description: 'A text violates national language standards.',
          notes: '',
          examples: 'A French advertising text uses anglicisms that are forbidden for print texts by the Academie française specifications.',
        },
        {
          issue: 'shortcut-key',
          parent: null,
          name: 'shortcut key',
          description: 'A translated software product uses shortcuts that do not conform to locale expectations or that make no sense for the locale.',
          notes: 'Very often this error indicates an underlying internationalization root cause.',
          examples: 'A software product uses CTRL-S to save a file in Hungarian, rather than the appropriate CTRL-M (for mentenni).',
        },
      ], 
      command: "", 
      rowCount: 3, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getSegmentIssuesByProjectId").mockResolvedValueOnce({ 
      rows: [
        {
          segment_id: 1,
          type: 'target',
          issue_name: 'Fluency',
          level: 'minor',
          id: 1,
          issue: 'fluency',
          note: 'test',
          highlight_start_index: 0,
          highlight_end_index: 10,
        }
      ], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })
    jest.spyOn(IssueService.prototype, "getProjectReportById").mockResolvedValueOnce({ 
      rows: [
        {
          level: ['critical'],
        },
        {
          level: ['minor'],
        },
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    })
    jest.spyOn(SegmentService.prototype, "getSegmentsByProjectId").mockResolvedValueOnce({ 
      rows: [{
        id: 1,
        segment_num: 1,
        segment_data: {
          Source: 'Test1',
          Target: 'Test2',
        },
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })

    await bottle.container.ProjectController.getProjectJSONReport(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      projectName: 'test',
      key: { 1: '1' },
      errors: [{
        segment: '1',
        target: 'target',
        name: 'Fluency',
        severity: 'minor',
        issueReportId: '1',
        issueId: 'fluency',
        note: 'test',
        highlighting: { startIndex: 0, endIndex: 10 },
      }],
      apt: 26,
      segments: {
        source: ['Test1'],
        target: ['Test2'],
      },
      metric: [
        {
          issueId: 'locale-specific-punctuation',
          parent: null,
          name: 'locale-specific punctuation',
          description: 'The text systematically uses punctuation marks that are not appropriate for the specified locale.',
          notes: '',
          examples: 'A text translated from English to Japanese maintains European-style punctuation—such as full-stops (.)—instead of using the appropriate Japanese punctuation, such as the Japanese full stop (。).',
        },
        {
          issueId: 'national-language-standard',
          parent: 'locale-specific-punctuation',
          name: 'national language standard',
          description: 'A text violates national language standards.',
          notes: '',
          examples: 'A French advertising text uses anglicisms that are forbidden for print texts by the Academie française specifications.',
        },
        {
          issueId: 'shortcut-key',
          parent: null,
          name: 'shortcut key',
          description: 'A translated software product uses shortcuts that do not conform to locale expectations or that make no sense for the locale.',
          notes: 'Very often this error indicates an underlying internationalization root cause.',
          examples: 'A software product uses CTRL-S to save a file in Hungarian, rather than the appropriate CTRL-M (for mentenni).',
        },
      ],
    });
  });

  it('should successfully get project assigned to user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'user',
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 2 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectById").mockResolvedValueOnce({ 
      rows: [{
        project_id: 1, 
        source_word_count: 200, 
        target_word_count: 300, 
        name: 'test',
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getProjectIssuesById").mockResolvedValueOnce({ 
      rows: [
        {
          issue: 'locale-specific-punctuation',
          parent: null,
          name: 'locale-specific punctuation',
          description: 'The text systematically uses punctuation marks that are not appropriate for the specified locale.',
          notes: '',
          examples: 'A text translated from English to Japanese maintains European-style punctuation—such as full-stops (.)—instead of using the appropriate Japanese punctuation, such as the Japanese full stop (。).',
        },
        {
          issue: 'national-language-standard',
          parent: 'locale-specific-punctuation',
          name: 'national language standard',
          description: 'A text violates national language standards.',
          notes: '',
          examples: 'A French advertising text uses anglicisms that are forbidden for print texts by the Academie française specifications.',
        },
        {
          issue: 'shortcut-key',
          parent: null,
          name: 'shortcut key',
          description: 'A translated software product uses shortcuts that do not conform to locale expectations or that make no sense for the locale.',
          notes: 'Very often this error indicates an underlying internationalization root cause.',
          examples: 'A software product uses CTRL-S to save a file in Hungarian, rather than the appropriate CTRL-M (for mentenni).',
        },
      ], 
      command: "", 
      rowCount: 3, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getSegmentIssuesByProjectId").mockResolvedValueOnce({ 
      rows: [
        {
          segment_id: 1,
          type: 'target',
          issue_name: 'Fluency',
          level: 'minor',
          id: 1,
          issue: 'fluency',
          note: 'test',
          highlight_start_index: 0,
          highlight_end_index: 10,
        }
      ], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })
    jest.spyOn(IssueService.prototype, "getProjectReportById").mockResolvedValueOnce({ 
      rows: [
        {
          level: ['critical'],
        },
        {
          level: ['minor'],
        },
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    })
    jest.spyOn(SegmentService.prototype, "getSegmentsByProjectId").mockResolvedValueOnce({ 
      rows: [{
        id: 1,
        segment_num: 1,
        segment_data: {
          Source: 'Test1',
          Target: 'Test2',
        },
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })

    await bottle.container.ProjectController.getProjectJSONReport(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      projectName: 'test',
      key: { 1: '1' },
      errors: [{
        segment: '1',
        target: 'target',
        name: 'Fluency',
        severity: 'minor',
        issueReportId: '1',
        issueId: 'fluency',
        note: 'test',
        highlighting: { startIndex: 0, endIndex: 10 },
      }],
      apt: 26,
      segments: {
        source: ['Test1'],
        target: ['Test2'],
      },
      metric: [
        {
          issueId: 'locale-specific-punctuation',
          parent: null,
          name: 'locale-specific punctuation',
          description: 'The text systematically uses punctuation marks that are not appropriate for the specified locale.',
          notes: '',
          examples: 'A text translated from English to Japanese maintains European-style punctuation—such as full-stops (.)—instead of using the appropriate Japanese punctuation, such as the Japanese full stop (。).',
        },
        {
          issueId: 'national-language-standard',
          parent: 'locale-specific-punctuation',
          name: 'national language standard',
          description: 'A text violates national language standards.',
          notes: '',
          examples: 'A French advertising text uses anglicisms that are forbidden for print texts by the Academie française specifications.',
        },
        {
          issueId: 'shortcut-key',
          parent: null,
          name: 'shortcut key',
          description: 'A translated software product uses shortcuts that do not conform to locale expectations or that make no sense for the locale.',
          notes: 'Very often this error indicates an underlying internationalization root cause.',
          examples: 'A software product uses CTRL-S to save a file in Hungarian, rather than the appropriate CTRL-M (for mentenni).',
        },
      ],
    });
  });

  it('should fail to get project not assigned to user', async () => {
    const bottle = constructBottle();
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        name: 'test',
      },
      role: 'user',
      params: {
        projectId: "2",
      },
    });

    jest.spyOn(ProjectService.prototype, "getProjectsByUserId").mockResolvedValueOnce({ 
      rows: [{ project_id: 1 }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(ProjectService.prototype, "getProjectById").mockResolvedValueOnce({ 
      rows: [{ project_id: 1, source_word_count: 200, target_word_count: 300, name: 'test' }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    });
    jest.spyOn(IssueService.prototype, "getSegmentIssuesByProjectId").mockResolvedValueOnce({ 
      rows: [
        {
          segment_id: 1,
          type: 'target',
          issue_name: 'Fluency',
          level: 'minor',
          id: 1,
          issue: 'fluency',
          note: 'test',
          highlight_start_index: 0,
          highlight_end_index: 10,
        }
      ], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })
    jest.spyOn(IssueService.prototype, "getProjectReportById").mockResolvedValueOnce({ 
      rows: [
        {
          level: ['critical'],
        },
        {
          level: ['minor'],
        },
      ], 
      command: "", 
      rowCount: 2, 
      oid: 0, 
      fields: [] 
    })
    jest.spyOn(SegmentService.prototype, "getSegmentsByProjectId").mockResolvedValueOnce({ 
      rows: [{
        id: 1,
        segment_num: 1,
        segment_data: {
          Source: 'Test1',
          Target: 'Test2',
        },
      }], 
      command: "", 
      rowCount: 1, 
      oid: 0, 
      fields: [] 
    })

    await bottle.container.ProjectController.getProjectJSONReport(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access Forbidden',
    });
  });
});
