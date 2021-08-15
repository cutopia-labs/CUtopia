export const courseRating = courseId => [
  {
    $match: {
      courseId,
    },
  },
  {
    $group: {
      _id: '$courseId',
      overall: {
        $avg: '$overall',
      },
      grading: {
        $avg: '$grading.grade',
      },
      teaching: {
        $avg: '$teaching.grade',
      },
      difficulty: {
        $avg: '$difficulty.grade',
      },
      content: {
        $avg: '$content.grade',
      },
    },
  },
];
