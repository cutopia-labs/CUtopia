import { describe, beforeAll, afterAll, it } from '@jest/globals';
import { CourseReportType, ReportCategory } from 'cutopia-types';

import { report } from '../controllers/report';
import ReportModel from '../models/report';

import { setup, teardown } from './env';

describe('Report', () => {
  beforeAll(async () => {
    await setup();
    // Empty the report documents
    await ReportModel.deleteMany({});
  });

  afterAll(teardown);

  it('Create report', async () => {
    const reportInput = {
      description: 'The course title and assessments are incorrect',
      identifier: 'ABCD1234',
      cat: ReportCategory.COURSE,
      types: [CourseReportType.COURSE_TITLE, CourseReportType.ASSESSMENTS],
    };
    const reportId = await report(reportInput);
    expect(ReportModel.findById(reportId)).resolves.toMatchObject(reportInput);
  });
});
