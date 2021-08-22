import { sendDiscussionMessage, getDiscussion } from 'mongodb';
import { Router } from 'express';

const router = Router();

router.route('/:courseId').get((req, res) => {
  getDiscussion({
    courseId: req.params.courseId,
    page: 0,
  })
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').post((req, res) => {
  sendDiscussionMessage(req.body)
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
