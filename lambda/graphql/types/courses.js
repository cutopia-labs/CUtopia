module.exports = `
  type Query {
    subjects(filter: SubjectFilter): [Subject]!
  }

  type Subject {
    name: String!
    courses: [Course]!
  }

  input CourseFilter {
    subject: [String]
    maxNum: Int
  }

  input SubjectFilter {
    requiredSubjects: [String]
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
    terms_sections: [TermSections]
    assessments: [AssessementComponent]
  }

  type TermSections {
    termName: String!
    sections: [CourseSection]
  }

  type CourseSection {
    name: String!
    startTimes: String!
    endTimes: String!
    days: String!
    locations: String!
    instructors: String!
  }

  type AssessementComponent {
    name: String!
    percentage: String!
  }
`;
