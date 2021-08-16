import { getRanking } from 'mongodb';
import { Router } from 'express';

const router = Router();

router.route('/:rankingId').get((req, res) => {
  getRanking(req.params.rankingId)
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
