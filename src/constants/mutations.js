import { gql } from '@apollo/client';

// CUTOPIA LOGIN Mutations
const LOGIN_CUTOPIA = gql`
  mutation ($username: String!, $password: String!) {
    login(input: {
      username: $username
      password: $password
    }) {
      code
      token
    }
  }`;

// CUTOPIA SIGNUP Mutations
const SEND_VERIFICATION = gql`
  mutation ($email: String!, $password: String!, $username: String!) {
    createUser(input: {
      username: $username,
      email: $email,
      password: $password
    }) {
      error
    }
  }`;

const VERIFY_USER = gql`
  mutation ($username: String!, $code: String!) {
    verifyUser(input: {
      username: $username
      code: $code
    }) {
      code
    }
}`;

// CUTOPIA PASSWORD RESET Mutations
const SEND_RESET_PASSWORD_CODE = gql`
  mutation ($username:String!) {
    sendResetPasswordCode(input:{
      username:$username
    }) {
      code
      error
    }
  }`;

const RESET_PASSWORD = gql`
  mutation ($username:String!, $newPassword: String!, $resetCode: String!) {
    resetPassword(input:{
      username: $username
      newPassword: $newPassword
      resetCode: $resetCode
    }) {
      code
      error
    }
  }`;

// REVIEW Mutations
const ADD_REVIEW = gql`
  mutation (
    $anonymous: Boolean!,
    $courseId: String!,
    $title: String,
    $term: String!,
    $section: String!,
    $lecturer: String!,
    $overall: Int!,
    $grading: ReviewDetailsInput!,
    $teaching: ReviewDetailsInput!,
    $difficulty: ReviewDetailsInput!,
    $content: ReviewDetailsInput!,
  ) {
    createReview(input: {
      anonymous: $anonymous,
      courseId: $courseId
      title: $title,
      term: $term,
      section: $section,
      lecturer: $lecturer,
      overall: $overall,
      grading: $grading,
      teaching: $teaching,
      difficulty: $difficulty,
      content: $content
    }) {
      createdDate
    }
  }`;

const VOTE_REVIEW = gql`
  mutation (
    $courseId: String!
    $createdDate: String!
    $vote: Int!
  ) {
    voteReview(input: {
      courseId: $courseId
      createdDate: $createdDate
      vote: $vote
    }) {
      error
    }
  }`;

export {
  LOGIN_CUTOPIA,
  SEND_VERIFICATION,
  VERIFY_USER,
  SEND_RESET_PASSWORD_CODE,
  RESET_PASSWORD,
  ADD_REVIEW,
  VOTE_REVIEW,
};
