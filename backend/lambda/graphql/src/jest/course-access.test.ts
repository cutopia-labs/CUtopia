import fs from 'fs';
import path from 'path';

import { describe, expect, it } from '@jest/globals';

describe('Course query access contract', () => {
  const schema = fs.readFileSync(
    path.join(__dirname, '../schemas/courses.graphql'),
    'utf8'
  );
  const courseQuery = schema
    .split('\n')
    .find(line => line.trim().startsWith('course('));

  it('is public and IP-rate-limited for the guest planner', () => {
    expect(courseQuery).toContain('@rateLimit(duration: 60, limit: 100)');
    expect(courseQuery).not.toContain('@auth');
  });
});
