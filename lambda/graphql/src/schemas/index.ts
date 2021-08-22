import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';
import {
  range,
  stringLength,
  ValidateDirectiveVisitor,
} from '@profusion/apollo-validation-directives';

import { join } from 'path';

const graphqlFiles = [
  './courses.graphql',
  './directives.graphql',
  './ranking.graphql',
  './report.graphql',
  './reviews.graphql',
  './timetable.graphql',
  './user.graphql',
  './discussion.graphql',
].map(relativePath => join(__dirname, relativePath));

const typesArray = loadFilesSync(graphqlFiles);

const types = mergeTypeDefs([
  scalarTypeDefs,
  ...ValidateDirectiveVisitor.getMissingCommonTypeDefs(),
  ...range.getTypeDefs(),
  ...stringLength.getTypeDefs(),
  ...typesArray,
]);

export default types;
