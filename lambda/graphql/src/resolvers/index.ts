import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as scalarResolvers } from 'graphql-scalars';

import coursesResolver from './course';
import discussionResolver from './discussion';
import rankingResolver from './ranking';
import reportResolver from './report';
import reviewsResolver from './review';
import timetableResolver from './timetable';
import userResolver from './user';

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
