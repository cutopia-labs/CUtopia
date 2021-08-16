import { report } from 'mongodb';
import { Router } from 'express';

const router = Router();

router.route('/').post((req, res) => {
  report(req.body)
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
