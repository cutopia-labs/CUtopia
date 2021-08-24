import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as scalarResolvers } from 'graphql-scalars';
import reviewsResolver from './review';
import coursesResolver from './course';
import userResolver from './user';
import rankingResolver from './ranking';
import timetableResolver from './timetable';
import reportResolver from './report';
import discussionResolver from './discussion';

const resolvers = [
  scalarResolvers,
  reviewsResolver,
  coursesResolver,
  userResolver,
  rankingResolver,
  timetableResolver,
  reportResolver,
  discussionResolver,
];

export default mergeResolvers(resolvers);
