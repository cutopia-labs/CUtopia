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

const projectRating = (field: string) => ({
  $project: {
    _id: '$_id',
    [field]: {
      $divide: [`$rating.${field}`, '$rating.numReviews'],
    },
  },
});

export const rankCoursesPipeline = (
  field: string,
  limit?: number,
  filter?: Record<string, string>
) =>
  [
    filter && {
      $match: filter,
    },
    projectRating(field),
    {
      $sort: {
        [field]: -1,
      },
    },
    {
      $limit: limit || 10,
    },
  ].filter(item => item);
