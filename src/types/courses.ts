type RatingField = 'grading' | 'content' | 'difficulty' | 'teaching';

type RatingFieldWithOverall =
  | 'overall'
  | 'grading'
  | 'content'
  | 'difficulty'
  | 'teaching';

type Subject = {
  name: string;
  courses: Course[];
};

interface Course {
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
}

interface CourseInfo extends Course {
  courseId: string;
}

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

type PlannerCourse = {
  courseId: string;
  title: string;
  sections: {
    [sectionName: string]: CourseSection;
  };
};

type Planner = {
  label?: string;
  key: number; // timestamp
  courses: PlannerCourse[];
};

type CourseSection = {
  name: string;
  startTimes: string[];
  endTimes: string[];
  days: number[];
  locations: string[];
  instructors: string[];
};

type AssessementComponent = {
  name: string;
  percentage: string;
};

type DepartmentCourses = {
  [department: string]: CourseSearchItem[];
};

type CourseSearchItem = {
  c: string;
  t: string;
};

type CourseConcise = {
  courseId: string;
  title: string;
};

export type {
  RatingField,
  RatingFieldWithOverall,
  DepartmentCourses,
  Subject,
  Course,
  CourseInfo,
  CourseRating,
  Term,
  CourseSection,
  AssessementComponent,
  CourseSearchItem,
  CourseConcise,
  PlannerCourse,
  Planner,
};
