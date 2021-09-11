import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';
import { constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { print } from 'graphql';
import { join } from 'path';
import { writeFileSync } from 'fs';

const graphqlFiles = [
  'courses.graphql',
  'directives.graphql',
  'ranking.graphql',
  'report.graphql',
  'reviews.graphql',
  'timetable.graphql',
  'user.graphql',
  'discussion.graphql',
].map(relativePath => join(__dirname, relativePath));

const typesArray = loadFilesSync(graphqlFiles);

const types = mergeTypeDefs([
  scalarTypeDefs,
  ...typesArray,
  [constraintDirectiveTypeDefs],
]);

writeFileSync(join(__dirname, 'bundle.graphql'), print(types));
