const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { typeDefs: scalarTypeDefs } = require('graphql-scalars');
const { range, stringLength, ValidateDirectiveVisitor } = require('@profusion/apollo-validation-directives');

const { join } = require('path');

const graphqlFiles = [
  './courses.graphql',
  './directives.graphql',
  './ranking.graphql',
  './report.graphql',
  './reviews.graphql',
  './search.graphql',
  './timetable.graphql',
  './user.graphql'
].map(relativePath => join(__dirname, relativePath));

const typesArray = loadFilesSync(graphqlFiles);

module.exports = mergeTypeDefs([
  scalarTypeDefs,
  ...ValidateDirectiveVisitor.getMissingCommonTypeDefs(),
  ...range.getTypeDefs(),
  ...stringLength.getTypeDefs(),
  ...typesArray
]);
