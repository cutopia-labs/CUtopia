module.exports = `
  type Query {
    subjects(filter: SubjectFilter): [Subject]!
  }

  input SubjectFilter {
    requiredSubjects: [String]
  }

  type Subject {
    name: String!
    courses(filter: CourseFilter): [Course]!
  }

  input CourseFilter {
    requiredCourses: [String]
  }

  type Course {
    code: String!
    title: String!
    career: String!
    units: String!
    grading: String!
    components: String!
    campus: String!
    academic_group: String!
    requirements: String!
    description: String!
    outcome: String!
    syllabus: String!
    required_readings: String!
    recommended_readings: String!
    terms: [Term]
    assessments: [AssessementComponent]
  }

  type Term {
    name: String!
    course_sections: [CourseSection]
  }

  type CourseSection {
    name: String!
    startTimes: [String]!
    endTimes: [String]!
    days: [String]!
    locations: [String]!
    instructors: [String]!
    reviews(input: ReviewFilter): [Review]!
  }

  type AssessementComponent {
    name: String!
    percentage: String!
  }

  input ReviewFilter {
    random: Int
  }

  type Review {
    author: String!
    anonymous: Boolean!
    createdTime: String!
    modifiedTime: String!
    lecturer: String!
    section: String!
    grading: ReviewDetails!
    teaching: ReviewDetails!
    difficulty: ReviewDetails!
    content: ReviewDetails!
  }

  type ReviewDetails {
    review: String!
    grade: String!
  }
`;
