import { writeFileSync } from 'fs';
import { join } from 'path';

import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';
import { constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';

const graphqlFiles = [
  'courses.graphql',
  'discussion.graphql',
  'ranking.graphql',
  'report.graphql',
  'reviews.graphql',
  'scalars.graphql',
  'timetable.graphql',
  'user.graphql',
].map(relativePath => join(__dirname, relativePath));

const typesArray = loadFilesSync(graphqlFiles);

const types = mergeTypeDefs([
  scalarTypeDefs,
  ...typesArray,
  [constraintDirectiveTypeDefs],
]);

writeFileSync(join(__dirname, 'bundle.graphql'), print(types));
