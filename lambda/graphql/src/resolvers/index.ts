import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as scalarResolvers } from 'graphql-scalars';
import reviewsResolver from './reviews';
import coursesResolver from './courses';
import userResolver from './user';
import rankingResolver from './ranking';
import timetableResolver from './timetable';
import reportResolver from './report';

const resolvers = [
  scalarResolvers,
  reviewsResolver,
  coursesResolver,
  userResolver,
  rankingResolver,
  timetableResolver,
  reportResolver,
];

export default mergeResolvers(resolvers);
