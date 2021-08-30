import { gql } from '@apollo/client';

// Course Information Query
export const COURSE_INFO_QUERY = gql`
  query ($courseId: String!) {
    courses(filter: { requiredCourses: [$courseId] }) {
      units
      title
      components
      requirements
      description
      syllabus
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
      reviewLecturers
      reviewTerms
    }
  }
`;

// Review Queries
export const REVIEWS_QUERY = gql`
  query (
    $courseId: String
    $sortBy: String
    $page: Int
    $lecturer: String
    $term: String
  ) {
    reviews(
      input: {
        courseId: $courseId
        page: $page
        lecturer: $lecturer
        term: $term
        sortBy: $sortBy
        ascending: false
      }
    ) {
      courseId
      username
      title
      createdAt
      upvotes
      downvotes
      myVote
      term
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

export const RECENT_REVIEWS_QUERY = gql`
  query {
    reviews(input: { ascending: true }) {
      courseId
      username
      title
      overall
      createdAt
      grading {
        text
      }
    }
  }
`;

// Add createdAt later

export const GET_REVIEW = gql`
  query ($courseId: String!, $createdAt: String!) {
    review(input: { courseId: $courseId, createdAt: $createdAt }) {
      courseId
      username
      title
      createdAt
      upvotes
      downvotes
      myVote
      term
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
      upvotes
      username
      exp
      level
      fullAccess
    }
  }
`;

// User Info Query
export const GET_USER_TIMETABLES = gql`
  query {
    me {
      sharedTimetables {
        id
        tableName
        createdAt
        expire
      }
      timetables {
        id
        tableName
        createdAt
        expire
      }
    }
  }
`;

// Top Rated Courses Query
export const TOP_RATED_COURSES_QUERY = gql`
  query ($criteria: String!) {
    ranking {
      rankedCourses(filter: { rankBy: $criteria }) {
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
  query ($courseId: String!, $term: String!) {
    courses(filter: { requiredCourses: [$courseId], requiredTerm: $term }) {
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
`;

export const GET_SHARE_TIMETABLE = gql`
  query ($id: String!) {
    timetable(id: $id) {
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
        }
      }
      tableName
      createdAt
      expireAt
    }
  }
`;

export const GET_MY_DISCUSSIONS = gql`
  query {
    me {
      discussions
    }
  }
`;

export const GET_DISCUSSIONS = gql`
  query ($courseId: String!, $page: Int) {
    discussion(input: { courseId: $courseId, page: $page }) {
      messages {
        text
        user
        id
      }
      nextPage
    }
  }
`;
