type Subject = {
  name: string;
  courses: Course[];
};

type Course = {
  subject: Subject;
  code: string;
  title: string;
  career: string;
  units: string;
  grading: string;
  components: string;
  campus: string;
  academic_group: string;
  requirements: string;
  description: string;
  outcome: string;
  syllabus: string;
  required_readings: string;
  recommended_readings: string;
  terms?: Term[];
  assessments?: AssessementComponent[];
  rating?: CourseRating;
};

type CourseRating = {
  numReviews: number;
  overall: number;
  grading: number;
  content: number;
  difficulty: number;
  teaching: number;
};

type Term = {
  name: string;
  course_sections?: [CourseSection];
};

type CourseSection = {
  name: string;
  startTimes: string[];
  endTimes: string[];
  days: string[];
  locations: string[];
  instructors: string[];
};

type AssessementComponent = {
  name: string;
  percentage: string;
};

export type {
  Subject,
  Course,
  CourseRating,
  Term,
  CourseSection,
  AssessementComponent,
};
