import { gql } from '@apollo/client';

const TIMETABLE_BASE = `
  entries {
    courseId
    title
    credits
    sections {
      name
      startTimes
      endTimes
      days
      locations
      instructors
      hide
    }
  }
  tableName
  createdAt
  expireAt`;

// CUTOPIA LOGIN Mutations
export const LOGIN_CUTOPIA = gql`
  mutation ($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      token
      me {
        reviewIds
        upvotes
        username
        exp
        fullAccess
        timetableId
      }
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
    $courseId: CourseID!
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
    $courseId: CourseID!
    $overall: overall_Int_min_0_max_4!
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

export const UPLOAD_TIMETABLE = gql`
  mutation (
    $entries: [CourseTableEntryInput]
    $expire: Int
    $tableName: String
    $_id: String
  ) {
    uploadTimetable(
      input: {
        _id: $_id
        entries: $entries
        tableName: $tableName
        expire: $expire
      }
    ) {
      _id
      createdAt
    }
  }
`;

export const REPORT = gql`
  mutation (
    $cat: Int!
    $types: [Int]!
    $description: description_String_NotNull_maxLength_10000!
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
  mutation ($id: String!, $switchTo: String) {
    removeTimetable(input: { _id: $id, switchTo: $switchTo }) {
      ${TIMETABLE_BASE}
      _id
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation ($courseId: CourseID!, $text: String!) {
    sendMessage(input: { courseId: $courseId, text: $text }) {
      id
    }
  }
`;

/* To switch timetableId */
export const SWITCH_TIMETABLE = gql`
  mutation ($id: String!) {
    switchTimetable(input: { _id: $id }) {
      ${TIMETABLE_BASE}
    }
  }
`;

/* To switch timetableId */
export const CLONE_TIMETABLE = gql`
  mutation ($id: String!) {
    cloneTimetable(input: { _id: $id }) {
      ${TIMETABLE_BASE}
      _id
    }
  }
`;
