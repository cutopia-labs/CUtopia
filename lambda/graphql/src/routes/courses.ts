import { getCourseData, rankCourses } from 'mongodb';
import { Router } from 'express';

const router = Router();

router.route('/info/:courseId').get((req, res) => {
  getCourseData({
    courseId: req.params.courseId,
  })
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

/*
router.route('/rating/:field').post((req, res) => {
  rankCourses(req.params.field, 20, req.body)
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});
*/

export default router;
