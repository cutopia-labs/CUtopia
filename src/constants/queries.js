import { gql } from '@apollo/client';

// Course Information Query

const COURSE_INFO_QUERY = gql`
  query ($subject: String!, $code: String!) {
    subjects(filter: {
      requiredSubjects: [$subject]
    }) {
      courses(filter: {
        requiredCourses: [$code]
      }) {
        units
        title
        components
        requirements
        description
        syllabus
        outcome
        required_readings
        recommended_readings
        academic_group
        assessments {
          name
          percentage
        },
      }
    }
  }`;

// Review Queries

const REVIEWS_QUERY = gql`
  query ($courseId: String) {
    reviews(input: {
      courseId: $courseId,
      ascendingDate: false
    }) {
      courseId
      username
      title
      createdDate
      upvotes
      downvotes
      myVote
      term
      section
      lecturer
      overall
      content {
        text
        grade
      }
      grading {
        text
        grade
      }
      teaching {
        text
        grade
      }
      difficulty {
        text
        grade
      }
    }
  }`;

const RECENT_REVIEWS_QUERY = gql`
  query {
    reviews(input: {
      ascendingDate: false
    }) {
      courseId
      username
      title
      createdDate
      term
      section
      lecturer
      overall
      content {
        text
        grade
      }
      grading {
        text
        grade
      }
      teaching {
        text
        grade
      }
      difficulty {
        text
        grade
      }
    }
  }`;

const GET_REVIEW = gql`
  query ($courseId: String!, $createdDate: String!) {
    review(input: {
      courseId: $courseId
      createdDate: $createdDate
    }) {
      courseId
      username
      title
      createdDate
      upvotes
      downvotes
    	myVote
      term
      section
      lecturer
      overall
      content {
        text
        grade
      }
      grading {
        text
        grade
      }
      teaching {
        text
        grade
      }
      difficulty {
        text
        grade
      }
    }
  }`;

// User Info Query

const GET_USER = gql`
  query ($username: String!) {
    user(input: {
      username: $username
    }) {
      reviewIds
      upvotesCount
    }
  }`;

export {
  COURSE_INFO_QUERY,
  REVIEWS_QUERY,
  RECENT_REVIEWS_QUERY,
  GET_REVIEW,
  GET_USER,
};
