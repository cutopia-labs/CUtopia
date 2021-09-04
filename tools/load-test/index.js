// this script is intended for server load test and lambda instances warmup

require('dotenv').config();
const { GraphQLClient, gql } = require('graphql-request');

const login = gql`
  mutation LoginMutation($loginInput: LoginInput!) {
    login(input: $loginInput) {
      token
    }
  }
`;

const getReviews = gql`
  query Query($reviewsInput: ReviewsFilter!) {
    reviews(input: $reviewsInput) {
      _id
      courseId
      username
      anonymous
      title
      createdAt
      term
      lecturer
      overall
      grading {
        grade
        text
      }
      teaching {
        grade
        text
      }
      difficulty {
        grade
        text
      }
      content {
        grade
        text
      }
      upvotes
      downvotes
      myVote
    }
  }
`;

const endpoint = process.env.GRAPHQL_ENDPOINT;

const testOne = async label => {
  const client = new GraphQLClient(endpoint);

  console.time(`boom ${label}`);
  const loginRes = await client.request(login, {
    loginInput: {
      username: process.env.AUTH_USERNAME,
      password: process.env.AUTH_PASSWORD,
    },
  });
  client.setHeader('Authorization', `Bearer ${loginRes.login.token}`);
  await client.request(getReviews, {
    reviewsInput: {
      courseId: null,
    },
  });
  await client.request(getReviews, {
    reviewsInput: {
      courseId: 'ENGG2760',
      sortBy: 'upvotes',
    },
  });
  await client.request(getReviews, {
    reviewsInput: {
      courseId: 'MATH1510',
      sortBy: 'createdAt',
    },
  });
  console.timeEnd(`boom ${label}`);
};

const testAll = async () => {
  console.time('all boom');
  await Promise.all(Array.from({ length: 10 }, (_, i) => i).map(testOne));
  console.timeEnd('all boom');
};

testAll().then(() => console.log('done'));
