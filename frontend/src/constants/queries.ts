import { gql } from '@apollo/client';

// Review Course Information Query
export const COURSE_INFO_QUERY = gql`
  query ($courseId: CourseID!) {
    course(filter: { requiredCourse: $courseId }) {
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

// Planner Courses Query
export const COURSE_SECTIONS_QUERY = gql`
  query ($courseId: CourseID!, $term: String!) {
    course(filter: { requiredCourse: $courseId, requiredTerm: $term }) {
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
      sections {
        name
        startTimes
        endTimes
        days
        locations
        instructors
        meetingDates
      }
    }
  }
`;

export const SWITCH_SECTION_QUERY = gql`
  query ($courseId: CourseID!, $term: String!) {
    course(filter: { requiredCourse: $courseId, requiredTerm: $term }) {
      sections {
        name
        startTimes
        endTimes
        days
        locations
        instructors
        meetingDates
      }
    }
  }
`;

// Review Queries
export const REVIEWS_QUERY = gql`
  query (
    $courseId: CourseID
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

export const RECENT_REVIEWS_GRADING_QUERY = gql`
  query ($page: Int!) {
    reviews(input: { ascending: false, sortBy: "createdAt", page: $page }) {
      courseId
      username
      createdAt
      grading {
        text
        grade
      }
    }
  }
`;

export const RECENT_REVIEWS_CONTENT_QUERY = gql`
  query ($page: Int!) {
    reviews(input: { ascending: false, sortBy: "createdAt", page: $page }) {
      courseId
      username
      createdAt
      content {
        text
        grade
      }
    }
  }
`;

export const RECENT_REVIEWS_TEACHING_QUERY = gql`
  query ($page: Int!) {
    reviews(input: { ascending: false, sortBy: "createdAt", page: $page }) {
      courseId
      username
      createdAt
      teaching {
        text
        grade
      }
    }
  }
`;

export const RECENT_REVIEWS_DIFFICULTY_QUERY = gql`
  query ($page: Int!) {
    reviews(input: { ascending: false, sortBy: "createdAt", page: $page }) {
      courseId
      username
      createdAt
      difficulty {
        text
        grade
      }
    }
  }
`;

// Add createdAt later

export const GET_REVIEW = gql`
  query ($courseId: CourseID!, $createdAt: String!) {
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
      fullAccess
      timetableId
    }
  }
`;

// User Timetables
export const GET_USER_TIMETABLES = gql`
  query {
    me {
      timetables {
        tableName
        createdAt
        expireAt
        _id
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
      rankedCourses(filter: { rankBy: "numReviews" }) {
        courseId
        course {
          title
        }
        numReviews
      }
    }
  }
`;

export const GET_TIMETABLE = gql`
  query ($id: String!) {
    timetable(_id: $id) {
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
          meetingDates
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
  query ($courseId: CourseID!, $page: Int) {
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
