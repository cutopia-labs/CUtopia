const { loadFilesSync } = require("@graphql-tools/load-files");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { join } = require("path");

const graphqlFiles = [
  "./courses.graphql",
  "./directives.graphql",
  "./reviews.graphql",
  "./search.graphql",
  "./user.graphql",
].map(relativePath => join(__dirname, relativePath));

const typesArray = loadFilesSync(graphqlFiles);

module.exports = mergeTypeDefs(typesArray);
