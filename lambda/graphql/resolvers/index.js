const { mergeResolvers } = require("@graphql-tools/merge");
const reviewsResolver = require("./reviews");
const searchResolver = require("./search");
const subjectsResolver = require("./subjects");
const userResolver = require("./user");
const rankingResolver = require("./ranking");
const timetableResolver = require("./timetable");

const resolvers = [
  reviewsResolver,
  searchResolver,
  subjectsResolver,
  userResolver,
  rankingResolver,
  timetableResolver,
];

module.exports = mergeResolvers(resolvers);
