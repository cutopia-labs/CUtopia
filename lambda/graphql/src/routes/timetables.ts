import { uploadTimetable, getSharedTimetable } from 'mongodb';
import { Router } from 'express';

const router = Router();

router.route('/:id').get((req, res) => {
  getSharedTimetable({
    id: req.params.id,
  })
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').post((req, res) => {
  uploadTimetable(req.body)
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
