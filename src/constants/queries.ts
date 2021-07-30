import { gql } from '@apollo/client';

// Course Information Query
export const COURSE_INFO_QUERY = gql`
  query ($subject: String!, $code: String!) {
    subjects(filter: { requiredSubjects: [$subject] }) {
      courses(filter: { requiredCourses: [$code] }) {
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
  }
`;

// Review Queries
export const REVIEWS_QUERY = gql`
  query (
    $courseId: String
    $ascendingVote: Boolean
    $ascendingDate: Boolean
    $lastEvaluatedKey: LastEvaluatedKeyInput
  ) {
    reviews(
      input: {
        courseId: $courseId
        ascendingVote: $ascendingVote
        ascendingDate: $ascendingDate
        lastEvaluatedKey: $lastEvaluatedKey
      }
    ) {
      reviews {
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
      lastEvaluatedKey {
        courseId
        createdDate
        upvotes
      }
    }
  }
`;

export const RECENT_REVIEWS_QUERY = gql`
  query {
    reviews(input: { getLatest: true }) {
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
  }
`;

export const GET_REVIEW = gql`
  query ($courseId: String!, $createdDate: String!) {
    review(input: { courseId: $courseId, createdDate: $createdDate }) {
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
  }
`;

// User Info Query
export const GET_USER = gql`
  query {
    me {
      reviewIds
      upvotesCount
      username
      exp
      level
    }
  }
`;

// Top Rated Courses Query
export const TOP_RATED_COURSES_QUERY = gql`
  query ($criteria: String!) {
    ranking {
      topRatedCourses(filter: { limit: 10, sortBy: $criteria }) {
        courseId
        course {
          title
        }
        overall
        grading
        content
        difficulty
        teaching
      }
    }
  }
`;

// Popular Courses Query
export const POPULAR_COURSES_QUERY = gql`
  query {
    ranking {
      popularCourses(filter: { limit: 10 }) {
        courseId
        course {
          title
        }
        numReviews
      }
    }
  }
`;

export const COURSE_SECTIONS_QUERY = gql`
  query ($subject: String!, $code: String!) {
    subjects(filter: { requiredSubjects: [$subject] }) {
      courses(filter: { requiredCourses: [$code] }) {
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
  }
`;

export const MY_TIMETABLE_QUERY = gql`
  query ($username: String!) {
    user(input: { username: $username }) {
      timetable {
        courseId
        title
        sections {
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
`;

export const GET_SHARE_TIMETABLE = gql`
  query ($id: String!) {
    timetable(id: $id) {
      entries {
        courseId
        title
        sections {
          name
          startTimes
          endTimes
          days
          locations
          instructors
        }
      }
      name
      createdDate
      expireDate
    }
  }
`;
