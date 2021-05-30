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
        }
        rating {
          numReviews
          overall
          grading
          content
          difficulty
          teaching
        }
      }
    }
  }`;

// Review Queries
const REVIEWS_QUERY = gql`
  query ($courseId: String, $ascendingVote:Boolean, $ascendingDate: Boolean) {
    reviews(input: {
      courseId: $courseId,
      ascendingVote: $ascendingVote,
      ascendingDate: $ascendingDate,
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
      getLatest: true
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

// Top Rated Courses Query
const TOP_RATED_COURSES_QUERY = gql`
  query ($criteria:String!) {
    ranking {
      topRatedCourses(filter:{
        limit:10,
        sortBy:$criteria,
      }) {
        courseId
        course {
          title
        }
        overall
      }
    }
  }`;

// Popular Courses Query
const POPULAR_COURSES_QUERY = gql`
  query {
    ranking {
      popularCourses(filter:{
        limit:10
      }) {
        courseId
        course {
          title
        }
        numReviews
      }
    }
  }`;

const COURSE_SECTIONS_QUERY = gql`
  query ($subject: String!, $code: String!) {
    subjects(filter: {
      requiredSubjects: [$subject]
    }) {
      courses(filter: {
        requiredCourses: [$code]
      }) {
        units
        title
        academic_group
        requirements
        rating {
          numReviews
          overall
          grading
          content
          difficulty
          teaching
        }
        terms {
          name
          course_sections {
            name
            startTimes
            endTimes
            days
            locations
            instructors
          }
        }
      }
    }
  }`;

export {
  COURSE_INFO_QUERY,
  REVIEWS_QUERY,
  RECENT_REVIEWS_QUERY,
  GET_REVIEW,
  GET_USER,
  TOP_RATED_COURSES_QUERY,
  POPULAR_COURSES_QUERY,
  COURSE_SECTIONS_QUERY,
};
