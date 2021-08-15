import { createReview } from 'mongodb';
const router = require('express').Router();

router.route('/').post((req, res) => {
  createReview(req.body)
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
