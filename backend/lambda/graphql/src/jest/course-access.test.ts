import fs from 'fs';
import path from 'path';

import { describe, expect, it } from '@jest/globals';

describe('Course query access contract', () => {
  const schema = fs.readFileSync(
    path.join(__dirname, '../schemas/courses.graphql'),
    'utf8'
  );
  const reviewsSchema = fs.readFileSync(
    path.join(__dirname, '../schemas/reviews.graphql'),
    'utf8'
  );
  const rankingSchema = fs.readFileSync(
    path.join(__dirname, '../schemas/ranking.graphql'),
    'utf8'
  );
  const courseQuery = schema
    .split('\n')
    .find(line => line.trim().startsWith('course('));
  const reviewsQuery = reviewsSchema
    .split('\n')
    .find(line => line.trim().startsWith('reviews('));
  const reviewQuery = reviewsSchema
    .split('\n')
    .find(line => line.trim().startsWith('review('));
  const rankingQuery = rankingSchema
    .split('\n')
    .find(line => line.trim().startsWith('rankedCourses('));

  it('keeps course metadata and aggregate ratings public', () => {
    expect(courseQuery).toContain('@rateLimit(duration: 60, limit: 100)');
    expect(courseQuery).not.toContain('@auth');
    expect(schema).toContain('rating: CourseRating');
  });

  it('keeps individual reviews behind authentication', () => {
    expect(reviewsQuery).toContain('@auth');
    expect(reviewQuery).toContain('@auth');
  });

  it('exposes aggregate rankings without exposing review records', () => {
    expect(rankingQuery).toContain('@rateLimit(duration: 60, limit: 100)');
    expect(rankingQuery).not.toContain('@auth');
    ['username', 'title', 'text', 'lecturer', 'term', 'createdAt'].forEach(
      privateField => expect(rankingSchema).not.toContain(`${privateField}:`)
    );
  });
});
