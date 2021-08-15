import { getCourseData } from 'mongodb';
import { Router } from 'express';

const router = Router();

router.route('/:courseId').get((req, res) => {
  getCourseData({
    courseId: req.params.courseId,
  })
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
