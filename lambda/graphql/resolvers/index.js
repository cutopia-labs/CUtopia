const { mergeResolvers } = require("@graphql-tools/merge");
const reviewsResolver = require("./reviews");
const searchResolver = require("./search");
const subjectsResolver = require("./subjects");
const userResolver = require("./user");
const rankingResolver = require("./ranking");

const resolvers = [
  reviewsResolver,
  searchResolver,
  subjectsResolver,
  userResolver,
  rankingResolver,
];

module.exports = mergeResolvers(resolvers);
