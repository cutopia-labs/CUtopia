import { gql } from '@apollo/client';

// CUTOPIA LOGIN Mutations
export const LOGIN_CUTOPIA = gql`
  mutation ($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      token
    }
  }
`;

// CUTOPIA SIGNUP Mutations
export const SEND_VERIFICATION = gql`
  mutation ($sid: String!, $password: String!, $username: String!) {
    createUser(input: { username: $username, SID: $sid, password: $password })
  }
`;

export const VERIFY_USER = gql`
  mutation ($username: String!, $code: String!) {
    verifyUser(input: { username: $username, code: $code })
  }
`;

// CUTOPIA PASSWORD RESET Mutations
export const SEND_RESET_PASSWORD_CODE = gql`
  mutation ($username: String!) {
    sendResetPasswordCode(input: { username: $username })
  }
`;

export const RESET_PASSWORD = gql`
  mutation ($username: String!, $newPassword: String!, $resetCode: String!) {
    resetPassword(
      input: {
        username: $username
        newPassword: $newPassword
        resetCode: $resetCode
      }
    )
  }
`;

// REVIEW Mutations
export const ADD_REVIEW = gql`
  mutation (
    $anonymous: Boolean!
    $courseId: String!
    $title: String
    $term: String!
    $lecturer: String!
    $overall: overall_Int_NotNull_min_0_max_4!
    $grading: ReviewDetailsInput!
    $teaching: ReviewDetailsInput!
    $difficulty: ReviewDetailsInput!
    $content: ReviewDetailsInput!
  ) {
    createReview(
      input: {
        anonymous: $anonymous
        courseId: $courseId
        title: $title
        term: $term
        lecturer: $lecturer
        overall: $overall
        grading: $grading
        teaching: $teaching
        difficulty: $difficulty
        content: $content
      }
    ) {
      createdAt
    }
  }
`;

export const EDIT_REVIEW = gql`
  mutation (
    $anonymous: Boolean!
    $courseId: String!
    $overall: overall_Int_NotNull_min_0_max_4!
    $grading: ReviewDetailsInput!
    $teaching: ReviewDetailsInput!
    $difficulty: ReviewDetailsInput!
    $content: ReviewDetailsInput!
  ) {
    editReview(
      input: {
        anonymous: $anonymous
        courseId: $courseId
        overall: $overall
        grading: $grading
        teaching: $teaching
        difficulty: $difficulty
        content: $content
      }
    )
  }
`;

export const VOTE_REVIEW = gql`
  mutation ($id: String!, $vote: Int!) {
    voteReview(input: { _id: $id, vote: $vote })
  }
`;

export const SHARE_TIMETABLE = gql`
  mutation (
    $entries: [CourseTableEntryInput]!
    $expire: Int!
    $tableName: String
  ) {
    uploadTimetable(
      input: { entries: $entries, tableName: $tableName, expire: $expire }
    ) {
      _id
    }
  }
`;

export const REPORT = gql`
  mutation (
    $cat: Int!
    $types: [Int]!
    $description: description_String_NotNull_maxLength_3000!
    $identifier: String
  ) {
    report(
      input: {
        cat: $cat
        types: $types
        description: $description
        identifier: $identifier
      }
    )
  }
`;

export const REMOVE_TIMETABLE = gql`
  mutation ($id: String!) {
    removeTimetable(_id: $id)
  }
`;

export const SEND_MESSAGE = gql`
  mutation ($courseId: String!, $text: String!) {
    sendMessage(input: { courseId: $courseId, text: $text }) {
      id
    }
  }
`;
