const { mergeResolvers } = require("@graphql-tools/merge");
const reviewsResolver = require("./reviews");
const searchResolver = require("./search");
const subjectsResolver = require("./subjects");
const userResolver = require("./user");

const resolvers = [
  reviewsResolver,
  searchResolver,
  subjectsResolver,
  userResolver,
];

module.exports = mergeResolvers(resolvers);
